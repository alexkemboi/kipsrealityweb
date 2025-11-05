import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// Create a new property
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      listingId,
      managerId,
      name,
      organizationId,
      propertyTypeId,
      locationId,
      city,
      address,
      bedrooms,
      bathrooms,
      size,
      amenities,
      isFurnished,
      availabilityStatus,
      propertyDetails, // contains either apartmentComplexDetail or houseDetail info
    } = data;

    // Validate property type
    const propertyType = await prisma.propertyType.findUnique({
      where: { id: propertyTypeId },
    });

    if (!propertyType) {
      return NextResponse.json(
        { error: "Invalid property type" },
        { status: 400 }
      );
    }

    // Create the property first
    const property = await prisma.property.create({
      data: {
        listingId,
        managerId,
        name,
        organizationId,
        propertyTypeId,
        locationId,
        city,
        address,
        amenities,
        isFurnished,
        availabilityStatus,
      },
    });

    // Create details based on property type
    if (propertyType.name.toLowerCase() === "apartment") {
      await prisma.apartmentComplexDetail.create({
        data: {
          propertyId: property.id,
          buildingName: propertyDetails?.buildingName || null,
          totalFloors: propertyDetails?.totalFloors || null,
          totalUnits: propertyDetails?.totalUnits || null,
        },
      });
    } else if (propertyType.name.toLowerCase() === "house") {
      await prisma.houseDetail.create({
        data: {
          propertyId: property.id,
          numberOfFloors: propertyDetails?.numberOfFloors || null,
          bedrooms: propertyDetails?.bedrooms || null,
          bathrooms: propertyDetails?.bathrooms || null,
          size: propertyDetails?.size || null,
        },
      });
    }

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

// Fetch all properties with details
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        propertyType: true,
        apartmentComplexDetail: true,
        houseDetail: true,
        units: true, // Include this if you’ve already created the Unit model
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = properties.map((p) => ({
      id: p.id,
      name: p.name,
      city: p.city,
      address: p.address,
      type: p.propertyType?.name,
      isFurnished: p.isFurnished,
      availabilityStatus: p.availabilityStatus,
      details: p.propertyType?.name.toLowerCase() === "apartment"
        ? p.apartmentComplexDetail
        : p.houseDetail,
      totalUnits: p.units?.length || 0,
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