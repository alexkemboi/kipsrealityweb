import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";

// POST /api/maintenance/:id/assign
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);

    // only property managers or system admins should assign requests
    if (payload.role !== "PROPERTY_MANAGER" && payload.role !== "SYSTEM_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id: requestId } = await params;
    const body = await req.json();
    const { vendorId } = body;

    if (!vendorId) {
      return NextResponse.json({ success: false, error: "vendorId is required" }, { status: 400 });
    }

    // verify vendor belongs to same organization (optional safety check)
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor || vendor.organizationId !== payload.organizationId) {
      return NextResponse.json({ success: false, error: "Vendor not found in your organization" }, { status: 404 });
    }

    // Conditional update to avoid race conditions: only update when still OPEN and unassigned
    const result = await (prisma as any).maintenanceRequest.updateMany({
      where: {
        id: requestId,
        organizationId: payload.organizationId,
        status: "OPEN",
        assigned_vendor_id: null,
      },
      data: {
        assigned_vendor_id: vendorId,
        assigned_at: new Date(),
        // status is NOT updated here
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: "Request is not open or already assigned" }, { status: 409 });
    }

    // return the updated record
    const updated = await (prisma as any).maintenanceRequest.findUnique({
      where: { id: requestId },
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, unitNumber: true, unitName: true } },
        requestedBy: { include: { user: { select: { firstName: true, lastName: true } } } },
        vendors: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
