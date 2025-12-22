import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


// http://localhost:3000/api/maintenance?organizationId=1&status=OPEN&unassigned=true&propertyId=1&vendorId=1
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const organizationId = url.searchParams.get("organizationId");
    const status = url.searchParams.get("status");
    const unassigned = url.searchParams.get("unassigned"); // expected "true" if present
    const propertyId = url.searchParams.get("propertyId"); // NEW: get propertyId from query
    const vendorId = url.searchParams.get("vendorId");

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    // Build a where clause incrementally so we don't break existing callers
    const where: any = { organizationId };
    if (status) {
      where.status = status;
    }
    if (unassigned === "true") {
      where.assigned_vendor_id = null;
    }
    if (propertyId) {
      where.propertyId = propertyId;
    }
    if (vendorId) {
      where.assigned_vendor_id = vendorId;
    }

    const requests = await (prisma as any).maintenanceRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            apartmentComplexDetail: { select: { buildingName: true } },
            houseDetail: { select: { houseName: true } },
          }
        },
        requestedBy: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        unit: { select: { id: true, unitNumber: true, unitName: true } },
        vendors: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);
    // Check if error is due to missing table/column
    if ((error as any)?.message?.includes("does not exist")) {
      return NextResponse.json({ error: "Maintenance requests feature not yet available" }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to fetch maintenance requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('POST /api/maintenance body:', body);
    const { organizationId, propertyId, unitId, userId, title, description, priority, category } = body;

    if (!organizationId || !propertyId || !unitId || !userId || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the OrganizationUser record for this user in the organization
    const orgUser = await prisma.organizationUser.findFirst({ where: { userId, organizationId } });

    if (!orgUser) {
      return NextResponse.json({ error: "User is not associated with the organization" }, { status: 403 });
    }

    // Validate priority (Prisma enum expects: LOW | NORMAL | HIGH | URGENT)
    const allowedPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"];
    if (priority && !allowedPriorities.includes(priority)) {
      return NextResponse.json({ error: `Invalid priority value: ${priority}` }, { status: 400 });
    }

    // Validate category (RequestCategory: EMERGENCY | URGENT | ROUTINE | STANDARD)
    const allowedCategories = ["EMERGENCY", "URGENT", "ROUTINE", "STANDARD"];
    if (category && !allowedCategories.includes(category)) {
      return NextResponse.json({ error: `Invalid category value: ${category}` }, { status: 400 });
    }

    const newRequest = await (prisma as any).maintenanceRequest.create({
      data: {
        organizationId,
        propertyId,
        unitId,
        requestedById: orgUser.id,
        title,
        description,
        ...(priority ? { priority } : {}),
        ...(category ? { category } : {}),
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error(error);
    // Check if error is due to missing table
    if ((error as any)?.message?.includes("does not exist")) {
      return NextResponse.json({ error: "Maintenance requests feature not yet available" }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to create maintenance request" }, { status: 500 });
  }
}
