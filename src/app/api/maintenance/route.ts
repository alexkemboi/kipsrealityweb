import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const requests = await (prisma as any).maintenanceRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { id: true, name: true, address: true, city: true } },
        requestedBy: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        unit: { select: { id: true, unitNumber: true, unitName: true } },
      },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);
    // Check if error is due to missing table
    if ((error as any)?.message?.includes("does not exist")) {
      return NextResponse.json({ error: "Maintenance requests feature not yet available" }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to fetch maintenance requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, propertyId, unitId, userId, title, description, priority } = body;

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

    const newRequest = await (prisma as any).maintenanceRequest.create({
      data: {
        organizationId,
        propertyId,
        unitId,
        requestedById: orgUser.id,
        title,
        description,
        ...(priority ? { priority } : {}),
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
