import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // 1. Find all active leases (Batching: Take 50 at a time to stay within Vercel's timeout)
    const activeLeases = await prisma.lease.findMany({
      where: { status: "ACTIVE" },
      take: 50, // Batching strategy
    });

    const results = await Promise.allSettled(
      activeLeases.map(async (lease) => {
        // Use a transaction for each lease to ensure atomicity for THAT specific invoice
        return await prisma.$transaction(async (tx) => {
          // 2. Calculate next due date
          const dueDate = calculateNextDueDate({
            paymentFrequency: lease.paymentFrequency,
            paymentDueDay: lease.paymentDueDay ?? undefined,
          });

          // 3. Strict Idempotency: Check if an invoice for that period already exists
          const existing = await tx.invoice.findFirst({
            where: {
              leaseId: lease.id,
              type: "RENT",
              dueDate: {
                gte: new Date(dueDate.getFullYear(), dueDate.getMonth(), 1),
                lt: new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 1),
              },
            },
          });

          if (existing) {
            return { status: "skipped", leaseId: lease.id };
          }

          // 4. Create invoice inside transaction
          const invoice = await tx.invoice.create({
            data: {
              leaseId: lease.id,
              type: "RENT",
              amount: lease.rentAmount,
              dueDate,
              status: "PENDING",
            },
          });

          return { status: "created", leaseId: lease.id, invoiceId: invoice.id };
        });
      })
    );

    // 5. Analyze results for partial failures
    const created = results.filter((r) => r.status === "fulfilled" && (r.value as any).status === "created");
    const skipped = results.filter((r) => r.status === "fulfilled" && (r.value as any).status === "skipped");
    const failures = results.filter((r) => r.status === "rejected");

    if (failures.length > 0) {
      console.error("Partial failure in batch invoice generation:", failures);
      // In a real app, you might trigger an alert to Sentry/Admin here
    }

    return NextResponse.json({
      message: "Batch process completed",
      summary: {
        totalProcessed: activeLeases.length,
        created: created.length,
        skipped: skipped.length,
        failed: failures.length,
      },
      failures: failures.length > 0 ? failures.map((f: any) => f.reason?.message || "Unknown error") : undefined,
    });
  } catch (error) {
    console.error("Critical Auto Invoice Error:", error);
    return NextResponse.json(
      { error: "Internal System Error during invoice generation" },
      { status: 500 }
    );
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
