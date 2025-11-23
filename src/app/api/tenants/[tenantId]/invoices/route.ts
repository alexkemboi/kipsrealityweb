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
      where: { lease_id: { in: leaseIds } },
      include: {
        InvoiceItem: true,
        payment: true,
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
      },
    },
    unit: {
      select: {
        id: true,
        unitNumber: true,
      },
    },
  },
},
      },
      orderBy: { dueDate: "desc" },
    });

    // Map invoices to safe format
    const safeInvoices = invoices.map((inv) => ({
      id: inv.id,
      lease_id: inv.lease_id,
      type: inv.type,
      amount: Number(inv.amount),
      dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
      status: inv.status,
      createdAt: inv.createdAt ? inv.createdAt.toISOString() : null,
      updatedAt: inv.updatedAt ? inv.updatedAt.toISOString() : null,
      invoiceItems: (inv.InvoiceItem || []).map((it) => ({
        id: it.id,
        description: it.description,
        amount: Number(it.amount),
      })),
      payments: (inv.payment || []).map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        paidOn: p.paidOn ? p.paidOn.toISOString() : null,
        method: p.method,
        reference: p.reference,
      })),
Lease: inv.Lease ? {
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
      }
    : undefined,
  unit: inv.Lease.unit
    ? {
        id: inv.Lease.unit.id,
        unitNumber: inv.Lease.unit.unitNumber,
      }
    : undefined,
} : undefined,
    }));

    // Group by lease_id + dueDate
 // Group by lease_id + dueDate
const grouped: { [key: string]: any } = {};
safeInvoices.forEach((invoice) => {
  const dateKey = invoice.dueDate ? invoice.dueDate.split("T")[0] : "no-date";
  const groupKey = `${invoice.lease_id}-${dateKey}`;

  if (!grouped[groupKey]) {
    grouped[groupKey] = {
      lease_id: invoice.lease_id,
      date: dateKey,
      invoices: [],
      totalAmount: 0,
      totalPaid: 0,
      tenant: invoice.Lease?.tenant || {},      
      property: invoice.Lease?.property || {},  
      unit: invoice.Lease?.unit || {},          
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
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
