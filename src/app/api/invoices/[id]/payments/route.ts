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
    const body = await req.json();
    const { amount, method, reference } = body;

    console.log("Payment request:", { invoiceId, amount, method, reference, body });

    // Validation checks with specific error messages
    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    if (!method) {
      return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
    }

    if (!VALID_PAYMENT_METHODS.includes(method)) {
      return NextResponse.json({ 
        error: `Invalid payment method: ${method}. Must be one of: ${VALID_PAYMENT_METHODS.join(", ")}` 
      }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // ✅ Filter out reversed payments (same as frontend)
    const validPayments = invoice.payments?.filter(p => !p.isReversed) || [];
    const paidAmount = validPayments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = invoice.amount - paidAmount;

    console.log("Invoice details:", {
      invoiceAmount: invoice.amount,
      totalPayments: invoice.payments?.length,
      validPayments: validPayments.length,
      paidAmount,
      remaining,
      newPayment: amount,
    });

    if (amount > remaining + 0.01) {
      return NextResponse.json(
        {
          error: `Payment amount (${amount}) exceeds remaining balance (${remaining.toFixed(2)})`,
          details: {
            invoiceAmount: invoice.amount,
            alreadyPaid: paidAmount,
            remaining: remaining,
            attemptedPayment: amount,
          }
        },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoiceId,
        amount: parseFloat(amount.toString()),
        method,
        reference: reference || null,
      },
    });

    const newTotalPaid = paidAmount + amount;
    const isPaidInFull = newTotalPaid >= invoice.amount - 0.01;

    let newStatus = invoice.status;

    if (isPaidInFull) {
      newStatus = "PAID";
    } else {
      const now = new Date();
      const dueDate = new Date(invoice.dueDate);
      newStatus = now > dueDate ? "OVERDUE" : "PENDING";
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
    });

    console.log("Payment successful:", { payment, newStatus, newTotalPaid });

    return NextResponse.json({
      success: true,
      payment,
      status: newStatus,
      totalPaid: newTotalPaid,
      remaining: invoice.amount - newTotalPaid,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { 
        error: "Failed to process payment",
        details: error instanceof Error ? error.message : String(error)
      },
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
      where: { invoiceId: invoiceId },
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