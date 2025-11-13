// /app/api/receipt/generate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();
    
    // Check if receipt already exists
    const existingReceipt = await prisma.receipt.findFirst({
      where: { payment_id: paymentId },
    });
    
    if (existingReceipt) {
      return NextResponse.json(existingReceipt);
    }
    
    // Generate new receipt
    const receiptNo = `RCT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });
    
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    
    const receipt = await prisma.receipt.create({
      data: {
        receiptNo,
        payment_id: paymentId,
        invoice_id: payment.invoice_id,
        issuedOn: new Date(),
      },
    });
    
    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Error generating receipt:", error);
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}