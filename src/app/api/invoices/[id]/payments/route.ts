// /app/api/invoices/[id]/payments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const VALID_PAYMENT_METHODS = ["CASH", "BANK", "CREDIT_CARD"] as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    const { amount, method, reference } = await req.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    // Validate payment method
    if (!VALID_PAYMENT_METHODS.includes(method)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    // Get invoice with existing payments
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payment: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Calculate already paid amount
    const paidAmount = invoice.payment?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const remaining = invoice.amount - paidAmount;

    // Validate payment doesn't exceed remaining balance
    if (amount > remaining) {
      return NextResponse.json(
        { error: `Payment amount (${amount}) exceeds remaining balance (${remaining})` },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoice_id: invoiceId,
        amount,
        method,
        reference: reference || null,
      },
    });

    // Calculate new total paid
    const newTotalPaid = paidAmount + amount;
    const isPaidInFull = newTotalPaid >= invoice.amount;

    // Update invoice status if fully paid
    if (isPaidInFull) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" },
      });
    }

    return NextResponse.json({
      success: true,
      payment,
      status: isPaidInFull ? "PAID" : "PENDING",
      totalPaid: newTotalPaid,
      remaining: invoice.amount - newTotalPaid,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;

    const payments = await prisma.payment.findMany({
      where: { invoice_id: invoiceId },
      orderBy: { paidOn: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}