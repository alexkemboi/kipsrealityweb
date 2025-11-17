// src/app/api/tenants/[tenantId]/invoices/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, context: { params: { tenantId: string } }) {
  try {
    const { tenantId } = context.params;

    // Find leases that belong to tenant
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
        InvoiceItem: true, // invoice line items
        payment: true,     // payments related to the invoice
        Lease: {
          include: {
            property: { select: { id: true, name: true, address: true } },
            unit: { select: { id: true, unitNumber: true } },
          },
        },
      },
      orderBy: { dueDate: "desc" },
    });

    // map into safer client shape (dates -> ISO string)
    const safe = invoices.map((inv) => ({
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
      lease: inv.Lease ? {
        id: inv.Lease.id,
        property: inv.Lease.property ? { id: inv.Lease.property.id, name: inv.Lease.property.name } : undefined,
        unit: inv.Lease.unit ? { id: inv.Lease.unit.id, unitNumber: inv.Lease.unit.unitNumber } : undefined,
      } : undefined,
    }));

    return NextResponse.json({ success: true, data: safe });
  } catch (error) {
    console.error("GET /api/tenants/[tenantId]/invoices error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch invoices for tenant" }, { status: 500 });
  }
}
