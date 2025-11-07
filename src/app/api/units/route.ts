// src/app/api/units/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");

  if (!propertyId) {
    return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { units: true, apartmentComplexDetail: true },
    });

    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    const totalUnits = property.apartmentComplexDetail?.totalUnits ?? 0;
    const existingUnits = property.units || [];

    // Generate placeholders
    const allUnits = Array.from({ length: totalUnits }, (_, i) => {
      // Use DB unit numbers if they exist, otherwise sequential placeholders
      const expectedUnitNumber = (i + 1 + 100).toString(); // Example: 101, 102, 103…
      const existing = existingUnits.find(u => u.unitNumber === expectedUnitNumber);
      return existing || {
        id: null,
        unitNumber: expectedUnitNumber,
        unitName: null,
        bedrooms: null,
        bathrooms: null,
        floorNumber: null,
        rentAmount: null,
        isOccupied: false,
      };
    });

    return NextResponse.json(allUnits);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}
