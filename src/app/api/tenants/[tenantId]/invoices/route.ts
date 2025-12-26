import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, context: { params: { tenantId: string } }) {
  try {
    const { tenantId } = context.params;

    // Fetch all leases for this tenant
    const leases = await prisma.lease.findMany({
      where: { tenantId },
      select: { id: true },
    });

    if (!leases.length) {
      return NextResponse.json({ success: true, data: [] });
    }

    const leaseIds = leases.map((l) => l.id);

    // Fetch invoices for those leases
    const invoices = await prisma.invoice.findMany({
      where: { leaseId: { in: leaseIds } },
      include: {
        invoiceItems: true,
        payments: true,
        lease: {
          include: {
            tenant: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              }
            },
            property: {
              select: {
                id: true,
                name: true,
                address: true,
                apartmentComplexDetail: {
                  select: {
                    buildingName: true
                  }
                },
                houseDetail: {
                  select: {
                    houseName: true
                  }
                }
              },
            },
            unit: {
              select: {
                id: true,
                unitNumber: true,
              },
            },
            leaseUtilities: {
              include: {
                utility: true,
                utilityReadings: { orderBy: { readingDate: "desc" }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { dueDate: "desc" },
    });

    // Map invoices to safe format
    const safeInvoices = invoices.map((inv: any) => ({
      id: inv.id,
      leaseId: inv.leaseId,
      type: inv.type,
      amount: Number(inv.amount),
      dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
      status: inv.status,
      createdAt: inv.createdAt ? inv.createdAt.toISOString() : null,
      updatedAt: inv.updatedAt ? inv.updatedAt.toISOString() : null,
      invoiceItems: (inv.invoiceItems || []).map((it: any) => ({
        id: it.id,
        description: it.description,
        amount: Number(it.amount),
      })),
      payments: (inv.payments || []).map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        paidOn: p.paidOn ? p.paidOn.toISOString() : null,
        method: p.method,
        reference: p.reference,
      })),
      lease: inv.lease ? {
        tenant: inv.lease.tenant
          ? {
            firstName: inv.lease.tenant.firstName,
            lastName: inv.lease.tenant.lastName,
            email: inv.lease.tenant.email,
          }
          : undefined,
        property: inv.lease.property
          ? {
            id: inv.lease.property.id,
            name: inv.lease.property.name,
            address: inv.lease.property.address,
            apartmentComplexDetail: inv.lease.property.apartmentComplexDetail
              ? {
                buildingName: inv.lease.property.apartmentComplexDetail.buildingName,
              }
              : undefined,
            houseDetail: inv.lease.property.houseDetail
              ? {
                houseName: inv.lease.property.houseDetail.houseName,
              }
              : undefined,
          }
          : undefined,
        unit: inv.lease.unit
          ? {
            id: inv.lease.unit.id,
            unitNumber: inv.lease.unit.unitNumber,
          }
          : undefined,
      } : undefined,
      utilities: inv.lease?.leaseUtilities?.map((lu: any) => ({
        id: lu.utility.id,
        name: lu.utility.name,
        type: lu.utility.name, // Fixed: use name as type placeholder if type is missing, or lu.utility.type if it exists
        fixedAmount: lu.utility.fixedAmount ?? 0,
        unitPrice: lu.utility.unitPrice ?? 0,
        isTenantResponsible: lu.isTenantResponsible,
        lastReading: lu.utilityReadings?.[0]?.readingValue ?? null,
      })),
    }));

    // Group by leaseId + dueDate
    const grouped: { [key: string]: any } = {};
    safeInvoices.forEach((invoice: any) => {
      const dateKey = invoice.dueDate ? invoice.dueDate.split("T")[0] : "no-date";
      const groupKey = `${invoice.leaseId}-${dateKey}`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          leaseId: invoice.leaseId,
          date: dateKey,
          invoices: [],
          totalAmount: 0,
          totalPaid: 0,
          tenant: invoice.lease?.tenant || {},
          property: invoice.lease?.property || {},
          unit: invoice.lease?.unit || {},
        };
      }

      grouped[groupKey].invoices.push(invoice);

      grouped[groupKey].totalAmount += invoice.amount;
      grouped[groupKey].totalPaid += invoice.payments?.reduce(
        (sum: number, p: any) => sum + (p.amount ?? 0),
        0
      ) ?? 0;
    });

    const result = Object.values(grouped).sort(
      (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/tenants/[tenantId]/invoices error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices for tenant" },
      { status: 500 }
    );
  }
}
