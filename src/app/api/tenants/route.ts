// src/app/api/tenants/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // your existing prisma helper

// GET /api/tenants
export async function GET(req: Request) {
  try {
    // Fetch leases with tenant, property, unit and related invoices+payments
    const leases = await prisma.lease.findMany({
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, unitNumber: true } },
        invoices: {
          include: {
            payments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute financial summary per lease
    const result = leases.map((l) => {
      const totalInvoiced = (l.invoices || []).reduce((s, inv) => s + (inv.totalAmount ?? 0), 0);
      const totalPaid = (l.invoices || []).reduce(
        (s, inv) => s + ((inv.payments || []).reduce((ps, p) => ps + (p.amount ?? 0), 0)),
        0
      );
      const balance = totalInvoiced - totalPaid;

      return {
        id: l.id,
        startDate: l.startDate,
        endDate: l.endDate,
        rentAmount: l.rentAmount,
        securityDeposit: l.securityDeposit,
        status: l.leaseStatus,
        tenant: l.tenant ? {
          id: l.tenant.id,
          name: l.tenant.firstName ? `${l.tenant.firstName} ${l.tenant.lastName ?? ""}`.trim() : undefined,
          email: l.tenant.email,
          phone: l.tenant.phone ?? null,
        } : undefined,
        property: l.property ? { id: l.property.id, name: l.property.name } : undefined,
        unit: l.unit ? { id: l.unit.id, unitNumber: l.unit.unitNumber } : undefined,
        financialSummary: {
          totalInvoiced,
          totalPaid,
          balance,
        },
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/tenants error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tenants" }, { status: 500 });
  }
}
