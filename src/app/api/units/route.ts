// src/app/api/units/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/Getcurrentuser"; 

type UnitPlaceholder = {
  id: string | null;
  unitNumber: string;
  unitName: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floorNumber: number | null;
  rentAmount: number | null;
  isOccupied: boolean;
};

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const organizationId = user.organizationId;
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    // Fetch all units for the organization if no propertyId
    if (!propertyId) {
      const units = await prisma.unit.findMany({
        where: {
          property: { organizationId },
        },
        include: { property: { select: { city: true } } },
        orderBy: { unitNumber: "asc" },
      });
      return NextResponse.json(units);
    }

    // Fetch units for a specific property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        units: true,
        apartmentComplexDetail: true,
        houseDetail: true,
      },
    });

    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    let allUnits: UnitPlaceholder[] = [];

    if (property.apartmentComplexDetail) {
      const totalUnits = property.apartmentComplexDetail.totalUnits ?? 0;
      const existingUnits = property.units || [];
      allUnits = Array.from({ length: totalUnits }, (_, i) => {
        const expectedUnitNumber = (i + 1).toString();
        const existing = existingUnits.find(u => u.unitNumber === expectedUnitNumber);
        return (
          existing || {
            id: null,
            unitNumber: expectedUnitNumber,
            unitName: null,
            bedrooms: null,
            bathrooms: null,
            floorNumber: null,
            rentAmount: null,
            isOccupied: false,
          }
        );
      });
    } else if (property.houseDetail) {
      const existingUnit = property.units[0];
      allUnits = [
        existingUnit || {
          id: null,
          unitNumber: "1",
          unitName: null,
          bedrooms: property.houseDetail.bedrooms ?? null,
          bathrooms: property.houseDetail.bathrooms ?? null,
          floorNumber: property.houseDetail.numberOfFloors ?? null,
          rentAmount: null,
          isOccupied: false,
        },
      ];
    }

    return NextResponse.json(allUnits);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}

