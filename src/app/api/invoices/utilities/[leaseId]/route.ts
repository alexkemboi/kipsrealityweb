import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper function - same as rent invoice calculation
function calculateNextDueDate(lease: { paymentFrequency: string; paymentDueDay?: number }) {
  const now = new Date();
  const day = lease.paymentDueDay || now.getDate();
  const nextDate = new Date(now.getFullYear(), now.getMonth(), day);

  if (lease.paymentFrequency === 'MONTHLY') {
    if (nextDate < now) nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (lease.paymentFrequency === 'QUARTERLY') {
    if (nextDate < now) nextDate.setMonth(nextDate.getMonth() + 3);
  } else if (lease.paymentFrequency === 'YEARLY') {
    if (nextDate < now) nextDate.setFullYear(nextDate.getFullYear() + 1);
  }

  return nextDate;
}

// POST /api/invoices/utilities/:leaseId -> Generate utility invoice
export async function POST(_req: Request, context: { params: Promise<{ leaseId: string }> }) {
  try {
    const { leaseId } = await context.params;

    // Check if lease exists and get payment details
    const leaseExists = await prisma.lease.findUnique({
      where: { id: leaseId },
      select: {
        id: true,
        paymentFrequency: true,
        paymentDueDay: true
      }
    });

    if (!leaseExists) {
      return NextResponse.json(
        { success: false, error: "Lease not found for the given ID." },
        { status: 404 }
      );
    }

    // Fetch all utilities linked to this lease
    const leaseUtilities = await prisma.lease_utility.findMany({
      where: { lease_id: leaseId },
      include: {
        utility: true,
        utility_reading: {
          orderBy: { readingDate: "desc" },
          take: 1, // latest reading
        },
      },
    });

    if (!leaseUtilities.length) {
      return NextResponse.json(
        { success: false, error: "No utilities found for this lease." },
        { status: 404 }
      );
    }

    // Calculate amounts per utility
    const items = leaseUtilities.map((lu) => {
      const { utility } = lu;
      let amount = 0;

      if (utility.type === "FIXED") {
        amount = utility.fixedAmount ?? 0;
      } else if (utility.type === "METERED") {
        const latestReading = lu.utility_reading[0];
        amount = (latestReading?.reading_value ?? 0) * (utility.unitPrice ?? 0);
      }

      return {
        name: utility.name,
        amount,
      };
    });

    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

    // Calculate due date using the same logic as rent invoices
    const dueDate = calculateNextDueDate({
      paymentFrequency: leaseExists.paymentFrequency,
      paymentDueDay: leaseExists.paymentDueDay ?? undefined,
    });

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        leaseId: leaseId,
        type: "UTILITY",
        totalAmount: totalAmount,
        dueDate: dueDate, // Now uses same logic as rent invoices
        InvoiceItem: {
          create: items.map((i) => ({
            description: i.name,
            amount: i.amount,
          })),
        },
      },
      include: {
        InvoiceItem: true,
        Lease: {
          include: {
            tenant: { select: { firstName: true, lastName: true, email: true } },
            property: { select: { name: true, address: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    console.error("Error generating utility invoice:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate utility invoice." },
      { status: 500 }
    );
  }
}