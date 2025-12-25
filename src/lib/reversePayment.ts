import { prisma } from "./db";

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
        id: crypto.randomUUID(),             // if needed for your UUID setup
        paymentId: payment.id,
        invoiceId: payment.invoiceId,
        amount: payment.amount,
        reason,
        reversedBy: userId,
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

    // ⚠️ 3) Adjust invoice (BUT your invoice model has NO amountPaid/balance fields)
    //     So we skip this step until you tell me your invoice structure.

    return { success: true };
  });
}
