import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { NextResponse } from "next/server";
import { invoice_status } from "@prisma/client"; // Prisma enum for invoice status

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { reason } = body || {};
  if (!reason) return NextResponse.json({ error: "Missing reversal reason" }, { status: 400 });

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });

    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    if (payment.is_reversed) return NextResponse.json({ error: "Payment already reversed" }, { status: 400 });

    // Transaction with timeout increased
    const result = await prisma.$transaction(
      async (tx) => {
        // 1️⃣ Mark the payment as reversed
        const reversedPayment = await tx.payment.update({
          where: { id },
          data: {
            is_reversed: true,
            reversed_at: new Date(),
            reversal_reason: reason,
            reversed_by: currentUser.id,
          },
        });

        // 2️⃣ Aggregate total paid for the invoice excluding reversed payments
        const totalPaidAgg = await tx.payment.aggregate({
          _sum: { amount: true },
          where: { invoice_id: payment.invoice_id, is_reversed: false },
        });
        const totalPaid = totalPaidAgg._sum.amount || 0;

        // 3️⃣ Calculate remaining balance
        const remaining = payment.invoice.amount - totalPaid;

        // 4️⃣ Determine new invoice status (use enum)
        let newStatus: invoice_status;
        const now = new Date();
        if (totalPaid >= payment.invoice.amount - 0.01) newStatus = invoice_status.PAID;
        else if (now > new Date(payment.invoice.dueDate)) newStatus = invoice_status.OVERDUE;
        else newStatus = invoice_status.PENDING;

        // 5️⃣ Update invoice with new status
        const updatedInvoice = await tx.invoice.update({
          where: { id: payment.invoice_id },
          data: { status: newStatus },
        });

        return {
          reversedPayment,
          totalPaid,
          remaining,
          status: newStatus,
          invoiceAmount: updatedInvoice.amount,
        };
      },
      { timeout: 15000 } // 15s transaction timeout
    );

    return NextResponse.json({
      success: true,
      ...result,
      message: `Payment reversed. Invoice status: ${result.status}. Remaining balance: KES ${result.remaining.toFixed(2)}`,
    });
  } catch (err: any) {
    console.error("Payment reversal error:", err);
    return NextResponse.json({ error: err.message || "Failed to reverse payment" }, { status: 500 });
  }
}
