import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { NextResponse } from "next/server";
import { invoice_status } from "@prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
    if (payment.isReversed) return NextResponse.json({ error: "Payment already reversed" }, { status: 400 });

    // Transaction with timeout increased
    const result = await prisma.$transaction(
      async (tx) => {
        // 1️⃣ Mark the payment as reversed
        const reversedPayment = await tx.payment.update({
          where: { id },
          data: {
            isReversed: true,
            reversedAt: new Date(),
            reversalReason: reason,
            reversedBy: currentUser.id,
          },
        });

        // 2️⃣ Aggregate total paid for the invoice excluding reversed payments
        const totalPaidAgg = await tx.payment.aggregate({
          _sum: { amount: true },
          where: { invoiceId: payment.invoiceId, isReversed: false },
        });
        const totalPaid = Number(totalPaidAgg._sum?.amount ?? 0);

        // 3️⃣ Calculate remaining balance
        const remaining = (payment.invoice?.totalAmount ?? 0) - totalPaid;

        // 4️⃣ Determine new invoice status (use enum)
        let newStatus: invoice_status;
        const now = new Date();
        const invoiceDueDate = payment.invoice?.dueDate ? new Date(payment.invoice.dueDate) : new Date();

        if (totalPaid >= (payment.invoice?.totalAmount ?? 0) - 0.01) newStatus = invoice_status.PAID;
        else if (now > invoiceDueDate) newStatus = invoice_status.OVERDUE;
        else newStatus = invoice_status.PENDING;

        // 5️⃣ Update invoice with new status
        const updatedInvoice = await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: newStatus },
        });

        return {
          reversedPayment,
          totalPaid,
          remaining,
          status: newStatus,
          invoiceAmount: updatedInvoice.totalAmount,
        };
      },
      { timeout: 15000 } // 15s transaction timeout
    );

    return NextResponse.json({
      success: true,
      ...result,
      message: `Payment reversed. Invoice status: ${result.status}. Remaining balance: USD ${result.remaining.toFixed(2)}`,
    });
  } catch (err: any) {
    console.error("Payment reversal error:", err);
    return NextResponse.json({ error: err.message || "Failed to reverse payment" }, { status: 500 });
  }
}
