import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/invoices/utilities/:leaseId -> Generate utility invoice
export async function POST(_req: Request, context: { params: Promise<{ leaseId: string }> }) {
  try {
    const { leaseId } = await context.params;

    // Check if lease exists
    const leaseExists = await prisma.lease.findUnique({ where: { id: leaseId } });
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

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        lease_id: leaseId,
        type: "UTILITY",
        amount: totalAmount,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // due in 7 days
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
