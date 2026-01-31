// src/app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

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
              select: {
                id: true,
                name: true,       // still fetched but not used
                address: true,
                apartmentComplexDetail: {
                  select: {
                    buildingName: true,
                  },
                },
                houseDetail: {
                  select: {
                    houseName: true,
                  },
                },
              },
            },
            lease_utility: {
              include: {
                utility: true,
                utility_reading: {
                  orderBy: { readingDate: "desc" },
                  take: 1,
                },
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

    const buildingName =
      invoice.Lease?.property?.apartmentComplexDetail?.buildingName ?? null;

    return NextResponse.json({
      ...invoice,
      postingStatus: (invoice as any).postingStatus, // Handle runtime property
      buildingName,
      utilities,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}
