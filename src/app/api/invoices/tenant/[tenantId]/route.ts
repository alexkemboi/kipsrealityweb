// /app/api/invoice/tenant/[tenantId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { tenantId: string } }) {
  try {
    const { tenantId } = params;

    // Fetch all invoices for leases where tenantId matches
    const invoices = await prisma.invoice.findMany({
      where: {
        Lease: {
          tenantId: tenantId, // matches the tenant
        },
      },
      orderBy: { dueDate: "asc" },
      include: {
        payment: true, // include any payments for this invoice
        Lease: true,   // optional: include lease info if needed
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices for tenant:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
