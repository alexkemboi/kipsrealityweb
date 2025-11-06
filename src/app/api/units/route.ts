// src/app/api/units/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");

  if (!propertyId) {
    return NextResponse.json(
      { error: "Missing propertyId" },
      { status: 400 }
    );
  }

  try {
    // Fetch property and check its type
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { apartmentComplexDetail: true, units: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const totalUnits = property.apartmentComplexDetail?.totalUnits ?? 0;
    const existingUnits = property.units || [];

    // Generate placeholders for missing units
    const allUnits = Array.from({ length: totalUnits }, (_, i) => {
      const unitNumber = `${i + 1}`;
      const existing = existingUnits.find((u) => u.unitNumber === unitNumber);
      return (
        existing || {
          id: null,
          unitNumber,
          bedrooms: null,
          bathrooms: null,
          rentAmount: null,
        }
      );
    });

    return NextResponse.json(allUnits);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}
