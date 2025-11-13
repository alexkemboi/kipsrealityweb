// /app/api/invoice/[id]/payments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id;
    const { amount, method, reference } = await req.json();

    // Validate payment input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }
    if (!method) {
      return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
    }

    // Fetch invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payment: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Reject if amount is less than invoice amount
    if (amount < invoice.amount) {
      return NextResponse.json(
        { error: "Payment must be for the full invoice amount" },
        { status: 400 }
      );
    }

    // Record payment
    const payment = await prisma.payment.create({
      data: {
        invoice_id: invoiceId,
        amount,
        method,
        reference,
      },
    });

    // Update invoice status to PAID
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID" }, // enum-safe
    });

    // Optionally, you can implement a receipt or log here if needed

    return NextResponse.json({ success: true, payment, status: "PAID" });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const payments = await prisma.payment.findMany({
      where: { invoice_id: params.id },
      orderBy: { paidOn: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
