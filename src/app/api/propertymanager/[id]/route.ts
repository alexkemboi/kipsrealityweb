import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

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
      details: property.propertyType?.name.toLowerCase() === "apartment"
        ? property.apartmentComplexDetail
        : property.houseDetail,
      totalUnits: property.units?.length || 0,
      createdAt: property.createdAt,
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching property:", error);
    return NextResponse.json({ error: "Failed to fetch property", details: error.message }, { status: 500 });
  }
}
