import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const today = new Date();

    // 1Find all active leases
    const activeLeases = await prisma.lease.findMany({
      where: { status: "ACTIVE" },
    });

    const generatedInvoices = [];

    for (const lease of activeLeases) {
      // 2 Calculate next due date
      const dueDate = calculateNextDueDate({
        paymentFrequency: lease.paymentFrequency,
        paymentDueDay: lease.paymentDueDay ?? undefined,
      });

      // 3 Check if an invoice for that period already exists
      const existing = await prisma.invoice.findFirst({
        where: {
          leaseId: lease.id,
          type: "RENT",
          dueDate: {
            gte: new Date(dueDate.getFullYear(), dueDate.getMonth(), 1),
            lt: new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 1),
          },
        },
      });

      if (existing) continue; // Skip if already created

      // 4 Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          leaseId: lease.id,
          type: "RENT",
          amount: lease.rentAmount,
          dueDate,
          status: "PENDING",
        },
      });

      generatedInvoices.push(invoice);
    }

    return NextResponse.json({
      message: `Generated ${generatedInvoices.length} invoices`,
      invoices: generatedInvoices,
    });
  } catch (error) {
    console.error("Auto invoice error:", error);
    return NextResponse.json({ error: "Failed to auto-generate invoices" }, { status: 500 });
  }
}

// Helper for due date calculation
function calculateNextDueDate(lease: { paymentFrequency: string; paymentDueDay?: number }) {
  const now = new Date();
  const day = lease.paymentDueDay || now.getDate();
  const nextDate = new Date(now.getFullYear(), now.getMonth(), day);

  if (lease.paymentFrequency === "MONTHLY") {
    if (nextDate < now) nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (lease.paymentFrequency === "QUARTERLY") {
    if (nextDate < now) nextDate.setMonth(nextDate.getMonth() + 3);
  } else if (lease.paymentFrequency === "YEARLY") {
    if (nextDate < now) nextDate.setFullYear(nextDate.getFullYear() + 1);
  }

  return nextDate;
}
