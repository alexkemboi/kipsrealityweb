import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { NextResponse } from "next/server";

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

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Mark payment as reversed
      const reversedPayment = await tx.payment.update({
        where: { id },
        data: {
          is_reversed: true,
          reversed_at: new Date(),
          reversal_reason: reason,
          reversed_by: currentUser.id,
        },
      });

      // Recalculate invoice totals excluding reversed payments
      const payments = await tx.payment.findMany({
        where: { invoice_id: payment.invoice_id, is_reversed: false },
      });

      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = payment.invoice.amount - totalPaid;

      // Determine new status
      let newStatus = payment.invoice.status;
      if (totalPaid >= payment.invoice.amount - 0.01) {
        newStatus = "PAID";
      } else if (new Date() > new Date(payment.invoice.dueDate)) {
        newStatus = "OVERDUE";
      } else {
        newStatus = "PENDING";
      }

      // Update invoice with new status and totals
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
    });

    return NextResponse.json({
      success: true,
      ...result,
      message: `Payment reversed. Invoice status: ${result.status}. Remaining balance: KES ${result.remaining.toFixed(2)}`,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to reverse payment" }, { status: 500 });
  }
}