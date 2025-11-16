// src/app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // fetch the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        Lease: {
          include: {
            tenant: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            property: {
              select: { id: true, name: true, address: true },
            },
            lease_utility: {
              include: {
                utility: true, // get the related utility details
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // optionally map the utilities to a simpler structure
    const utilities = invoice.Lease?.lease_utility?.map((lu) => ({
      id: lu.utility.id,
      name: lu.utility.name,
      type: lu.utility.type,
      fixedAmount: lu.utility.fixedAmount ?? 0,
      unitPrice: lu.utility.unitPrice ?? 0,
      isTenantResponsible: lu.is_tenant_responsible,
    }));

    return NextResponse.json({ ...invoice, utilities });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}
