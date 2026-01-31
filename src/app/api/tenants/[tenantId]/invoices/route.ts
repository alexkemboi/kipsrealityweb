import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  try {
    const { tenantId } = await params;

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
        InvoiceItem: true,
        payments: true,
        Lease: {
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
            lease_utility: {
              include: {
                utility: true,
                utility_reading: { orderBy: { readingDate: "desc" }, take: 1 },
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
      amount: Number(inv.totalAmount),
      dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
      status: inv.status,
      createdAt: inv.createdAt ? inv.createdAt.toISOString() : null,
      updatedAt: inv.updatedAt ? inv.updatedAt.toISOString() : null,
      invoiceItems: (inv.InvoiceItem || []).map((it: any) => ({
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
      lease: inv.Lease ? {
        tenant: inv.Lease.tenant
          ? {
            firstName: inv.Lease.tenant.firstName,
            lastName: inv.Lease.tenant.lastName,
            email: inv.Lease.tenant.email,
          }
          : undefined,
        property: inv.Lease.property
          ? {
            id: inv.Lease.property.id,
            name: inv.Lease.property.name,
            address: inv.Lease.property.address,
            apartmentComplexDetail: inv.Lease.property.apartmentComplexDetail
              ? {
                buildingName: inv.Lease.property.apartmentComplexDetail.buildingName,
              }
              : undefined,
            houseDetail: inv.Lease.property.houseDetail
              ? {
                houseName: inv.Lease.property.houseDetail.houseName,
              }
              : undefined,
          }
          : undefined,
        unit: inv.Lease.unit
          ? {
            id: inv.Lease.unit.id,
            unitNumber: inv.Lease.unit.unitNumber,
          }
          : undefined,
      } : undefined,
      utilities: inv.Lease?.lease_utility?.map((lu: any) => ({
        id: lu.utility.id,
        name: lu.utility.name,
        type: lu.utility.type || lu.utility.name,
        fixedAmount: lu.utility.fixedAmount ?? 0,
        unitPrice: lu.utility.unitPrice ?? 0,
        isTenantResponsible: lu.is_tenant_responsible,
        lastReading: lu.utility_reading?.[0]?.reading_value ?? null,
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
