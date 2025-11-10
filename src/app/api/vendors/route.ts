import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/vendors
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const organizationId = url.searchParams.get("organizationId");
    const serviceType = url.searchParams.get("serviceType");
    const isActive = url.searchParams.get("isActive");

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (serviceType) where.serviceType = serviceType;
    if (isActive !== null) where.isActive = isActive === "true";

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        organization: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error("Fetch vendors error", error);
    return NextResponse.json({ error: "Failed to fetch vendor data" }, { status: 500 });
  }
}

// POST /api/vendors
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, userId, companyName, serviceType, phone, email } = body;

    if (!organizationId || !userId || !companyName || !serviceType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Prevent duplicate vendor for same organization and user
    const existing = await prisma.vendor.findFirst({ where: { organizationId, userId } });
    if (existing) {
      return NextResponse.json({ error: "Vendor already exists for this user in the organization", vendor: existing }, { status: 409 });
    }

    const newVendor = await prisma.vendor.create({
      data: {
        organizationId,
        userId,
        companyName,
        serviceType,
        phone: phone ?? null,
        email: email ?? null,
      },
    });

    return NextResponse.json(newVendor, { status: 201 });
  } catch (error) {
    console.error("Create vendor error", error);
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}