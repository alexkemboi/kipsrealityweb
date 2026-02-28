// src/app/api/maintenance/requests/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth-context";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set([
  "OPEN",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
] as const);

export async function GET(req: Request) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    if (status && !ALLOWED_STATUSES.has(status as any)) {
      return NextResponse.json(
        { error: "Invalid status filter" },
        { status: 400 }
      );
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        organizationId: ctx.organizationId,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200, // safe default; add pagination later if you want
      select: {
        id: true,
        organizationId: true,
        propertyId: true,
        unitId: true,
        requestedById: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        assigned_vendor_id: true,
        cost: true,
        assigned_at: true,
        invoiceId: true,
        isTenantChargeable: true,
        journalEntryId: true,
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            unitName: true,
          },
        },
        vendors: {
          select: {
            id: true,
            companyName: true,
            serviceType: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(requests);
  } catch (err) {
    console.error("GET /api/maintenance/requests error:", err);
    return NextResponse.json(
      { error: "Failed to load maintenance requests" },
      { status: 500 }
    );
  }
}
