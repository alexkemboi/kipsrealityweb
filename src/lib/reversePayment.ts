import { prisma } from "./db";
import crypto from "crypto";
import { invoice_status } from "@prisma/client";

export async function reversePayment(paymentId: string, userId: string, reason: string) {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true }
    });

    if (!payment) throw new Error("Payment not found");
    if (payment.method !== "CASH") throw new Error("Only cash payments can be reversed.");
    if (payment.isReversed) throw new Error("Payment already reversed.");

    // 1) Create reversal audit record
    await tx.paymentReversal.create({
      data: {
        id: crypto.randomUUID(), // PaymentReversal has no default @id in schema
        payment_id: payment.id,
        invoice_id: payment.invoiceId,
        amount: Number(payment.amount),
        reason,
        reversed_by: userId,
      }
    });

    // 2) Mark payment as reversed
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        isReversed: true,
        reversedAt: new Date(),
        reversalReason: reason,
        reversedBy: userId,
      }
    });

    const totalPaidAgg = await tx.payment.aggregate({
      _sum: { amount: true },
      where: { invoiceId: payment.invoiceId, isReversed: false },
    });
    const totalPaid = Number(totalPaidAgg._sum.amount ?? 0);
    const totalAmount = Number(payment.invoice.totalAmount ?? 0);
    const balance = totalAmount - totalPaid;
    const dueDate = payment.invoice.dueDate ? new Date(payment.invoice.dueDate) : new Date();

    let status: invoice_status;
    if (totalPaid >= totalAmount - 0.01) status = invoice_status.PAID;
    else if (new Date() > dueDate) status = invoice_status.OVERDUE;
    else status = invoice_status.PENDING;

    await tx.invoice.update({
      where: { id: payment.invoiceId },
      data: {
        amountPaid: totalPaid,
        balance,
        status,
      },
    });

    return { success: true };
  });
}
