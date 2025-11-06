import { prisma } from "@/lib/db";
import { NextResponse,NextRequest } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; 
    console.log("🔍 Fetching property with ID:", id);

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyType: true,
        apartmentComplexDetail: true,
        houseDetail: true,
        units: true,
      },
    });

    if (!property) {
      console.log(" Property not found for ID:", id);
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const formatted = {
      id: property.id,
      name: property.name,
      city: property.city,
      address: property.address,
      type: property.propertyType?.name,
      isFurnished: property.isFurnished,
      availabilityStatus: property.availabilityStatus,
      details:
        property.propertyType?.name.toLowerCase() === "apartment"
          ? property.apartmentComplexDetail
          : property.houseDetail,
      totalUnits: property.units?.length || 0,
      createdAt: property.createdAt,
    };

    console.log(" Property fetched successfully:", formatted);

    return NextResponse.json(formatted, { status: 200 });
  } catch (error: any) {
    console.error(" Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property", details: error.message },
      { status: 500 }
    );
  }
}


export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const data = await req.json();

    const {
      name,
      city,
      address,
      amenities,
      isFurnished,
      availabilityStatus,
      propertyTypeId,
      apartmentComplexDetail,
      houseDetail,
    } = data;

    // 1️⃣ Fetch existing property with details
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyType: true,
        apartmentComplexDetail: true,
        houseDetail: true,
      },
    });

    if (!existingProperty) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // 2️⃣ Update main property fields
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        name,
        city,
        address,
        amenities,
        isFurnished,
        availabilityStatus,
        propertyTypeId,
      },
    });

    // 3️⃣ Update nested details if provided
    const typeName = existingProperty.propertyType?.name?.toLowerCase();

    if (typeName === "apartment" && apartmentComplexDetail) {
      if (existingProperty.apartmentComplexDetail) {
        await prisma.apartmentComplexDetail.update({
          where: { propertyId: id },
          data: apartmentComplexDetail,
        });
      } else {
        await prisma.apartmentComplexDetail.create({
          data: { propertyId: id, ...apartmentComplexDetail },
        });
      }
    }

    if (typeName === "house" && houseDetail) {
      if (existingProperty.houseDetail) {
        await prisma.houseDetail.update({
          where: { propertyId: id },
          data: houseDetail,
        });
      } else {
        await prisma.houseDetail.create({
          data: { propertyId: id, ...houseDetail },
        });
      }
    }

    // 4️⃣ Fetch the full updated property for frontend
    const completeProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyType: true,
        apartmentComplexDetail: true,
        houseDetail: true,
        units: true,
      },
    });

    return NextResponse.json(completeProperty, { status: 200 });
  } catch (err: any) {
    console.error("PUT Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    await prisma.$transaction(async (tx) => {
      await tx.unit.deleteMany({ where: { propertyId: id } });
      await tx.apartmentComplexDetail.deleteMany({ where: { propertyId: id } });
      await tx.houseDetail.deleteMany({ where: { propertyId: id } });
      await tx.property.delete({ where: { id } });
    });

    return NextResponse.json({ message: "Property deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}