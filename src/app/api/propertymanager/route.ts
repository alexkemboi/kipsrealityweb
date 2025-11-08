

// src/app/api/propertymanager/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      listingId,
      managerId,
      name,
      propertyTypeId,
      locationId,
      city,
      address,
      amenities,
      isFurnished,
      availabilityStatus,
      propertyDetails, // contains apartmentComplexDetail or houseDetail info
    } = data;

    // Validate managerId
    if (!managerId) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 }
      );
    }

    // Fetch manager from DB
    const orgUser = await prisma.organizationUser.findUnique({
      where: { id: managerId },
    });

    if (!orgUser) {
      return NextResponse.json(
        { error: "Invalid managerId" },
        { status: 400 }
      );
    }

    // Validate property type
    const propertyType = await prisma.propertyType.findUnique({
      where: { id: propertyTypeId },
    });

    if (!propertyType) {
      return NextResponse.json(
        { error: "Invalid propertyTypeId" },
        { status: 400 }
      );
    }

    // Transaction: create property + details + units
    const property = await prisma.$transaction(async (tx) => {
      // 1. Create property
      const prop = await tx.property.create({
        data: {
          listingId,
          managerId: orgUser.id,
          organizationId: orgUser.organizationId, // FK from manager
          name,
          propertyTypeId,
          locationId,
          city,
          address,
          amenities,
          isFurnished,
          availabilityStatus,
        },
      });

      // 2. Apartment handling
      if (propertyType.name.toLowerCase() === "apartment" && propertyDetails) {
        const complex = await tx.apartmentComplexDetail.create({
          data: {
            propertyId: prop.id,
            buildingName: propertyDetails.buildingName || null,
            totalFloors: propertyDetails.totalFloors || null,
            totalUnits: propertyDetails.totalUnits || null,
          },
        });

        const totalUnits = propertyDetails.totalUnits ?? 0;
        if (totalUnits > 0) {
          const unitsData = Array.from({ length: totalUnits }, (_, i) => ({
            propertyId: prop.id,
            complexDetailId: complex.id,
            unitNumber: `${i + 1}`,
          }));
          await tx.unit.createMany({ data: unitsData });
        }
      }

      // 3. House handling
      else if (propertyType.name.toLowerCase() === "house" && propertyDetails) {
        const house = await tx.houseDetail.create({
          data: {
            propertyId: prop.id,
            numberOfFloors: propertyDetails.numberOfFloors || null,
            bedrooms: propertyDetails.bedrooms || null,
            bathrooms: propertyDetails.bathrooms || null,
            size: propertyDetails.size || null,
          },
        });

        await tx.unit.create({
          data: {
            propertyId: prop.id,
            houseDetailId: house.id,
            unitNumber: "1",
          },
        });
      }

      return prop;
    });

    return NextResponse.json(
      { message: "Property created successfully", property },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");
    const organizationId = searchParams.get("organizationId");

    const whereClause: any = {};
    if (managerId) whereClause.managerId = managerId;
    if (organizationId) whereClause.organizationId = organizationId;

    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        propertyType: true,
        apartmentComplexDetail: true,
        houseDetail: true,
        units: true,
        manager: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = properties.map((p) => ({
      id: p.id,
      name: p.name,
      city: p.city,
      address: p.address,
      type: p.propertyType?.name || null,
      isFurnished: p.isFurnished,
      availabilityStatus: p.availabilityStatus,
      details:
        p.propertyType?.name.toLowerCase() === "apartment"
          ? p.apartmentComplexDetail
          : p.houseDetail,
      totalUnits: p.units?.length || 0,
      manager: p.manager
        ? {
            id: p.manager.user.id,
            email: p.manager.user.email,
            firstName: p.manager.user.firstName,
            lastName: p.manager.user.lastName,
            role: p.manager.role,
          }
        : null,
      organization: p.organization || null,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties", details: error.message },
      { status: 500 }
    );
  }
}
