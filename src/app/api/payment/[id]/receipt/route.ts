// /app/api/payment/[id]/receipt/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function generateReceiptNo(count: number) {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paymentId } = await params;

    // Find payment with its invoice
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Count existing receipts for this year
    const year = new Date().getFullYear();
    const count = await prisma.receipt.count({
      where: { createdAt: { gte: new Date(`${year}-01-01`) } },
    });

    const receiptNo = generateReceiptNo(count);

    // Create receipt
    const receipt = await prisma.receipt.create({
      data: {
        invoiceId: payment.invoiceId,
        paymentId: payment.id,
        receiptNo,
      },
    });

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    console.error("Error generating receipt:", error);
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}
