// src/app/api/units/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Define a unit type
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
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
  }

  // If propertyId is not provided, fetch all units for the organization
  if (!propertyId) {
    try {
      const units = await prisma.unit.findMany({
        where: {
          property: {
            organizationId
          }
        },
        include: {
          property: {
            select: {
              name: true,
              address: true,
              city: true
            }
          }
        },
        orderBy: {
          unitNumber: 'asc'
        }
      });
      return NextResponse.json(units);
    } catch (error) {
      console.error("Error fetching all units:", error);
      return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
    }
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        units: true,
        apartmentComplexDetail: true,
        houseDetail: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    let allUnits: UnitPlaceholder[] = [];

    if (property.apartmentComplexDetail) {
      // It's an apartment
      const totalUnits = property.apartmentComplexDetail.totalUnits ?? 0;
      const existingUnits = property.units || [];
      allUnits = Array.from({ length: totalUnits }, (_, i) => {
        const expectedUnitNumber = (i + 1 + 100).toString(); // 101, 102, ...
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
      // It's a house → always 1 unit
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
