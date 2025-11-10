// src/lib/units.ts
import { prisma } from "./db";
import { Unit } from "@/app/data/UnitData";
import { UnitFormData } from "@/components/Dashboard/propertymanagerdash/units/EditUnitForm";


export const fetchUnits = async (propertyId: string): Promise<Unit[]> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      units: {
        include: {
          appliances: true, 
        },
      },
      apartmentComplexDetail: true,
      houseDetail: true,
    },
  });

  if (!property) return [];

  const now = new Date().toISOString(); // fallback for placeholders
  let allUnits: Unit[] = [];

  if (property.apartmentComplexDetail) {
  // Apartment: generate placeholders based on totalUnits
  const totalUnits = property.apartmentComplexDetail.totalUnits ?? 0;
  const existingUnits = property.units || [];

  allUnits = Array.from({ length: totalUnits }, (_, i) => {
    const expectedUnitNumber = (i + 1 + 100).toString(); // 101, 102, ...
    const existing = existingUnits.find(u => u.unitNumber === expectedUnitNumber);

    const detail = property.apartmentComplexDetail!; // non-null because of the if-check above

    return {
      id: existing?.id ?? `placeholder-${expectedUnitNumber}`,
      propertyId: property.id,
      complexDetailId: detail.id,
      houseDetailId: null,
      unitNumber: existing?.unitNumber ?? expectedUnitNumber,
      unitName: existing?.unitName ?? null,
      bedrooms: existing?.bedrooms ?? null,
      bathrooms: existing?.bathrooms ?? null,
      floorNumber: existing?.floorNumber ?? null,
      rentAmount: existing?.rentAmount ?? null,
      isOccupied: existing?.isOccupied ?? false,
      createdAt: existing?.createdAt instanceof Date ? existing.createdAt.toISOString() : now,
      appliances: existing?.appliances?.map(a => ({
          id: a.id,
          name: a.name,
          createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : now,
        })) ?? []
    };
  });
} else if (property.houseDetail) {
    // House: only 1 unit
    const existing = property.units[0];
    allUnits = [
      {
        id: existing?.id ?? `placeholder-1`,
        propertyId: property.id,
        complexDetailId: null,
        houseDetailId: property.houseDetail.id,
        unitNumber: existing?.unitNumber ?? "1",
        unitName: existing?.unitName ?? null,
        bedrooms: existing?.bedrooms ?? property.houseDetail.bedrooms ?? null,
        bathrooms: existing?.bathrooms ?? property.houseDetail.bathrooms ?? null,
        floorNumber: existing?.floorNumber ?? property.houseDetail.numberOfFloors ?? null,
        rentAmount: existing?.rentAmount ?? null,
        isOccupied: existing?.isOccupied ?? false,
        createdAt: existing?.createdAt instanceof Date ? existing.createdAt.toISOString() : now,
         appliances: existing?.appliances?.map(a => ({
          id: a.id,
          name: a.name,
          createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : now,
        })) ?? [],
      },
    ];
  }

  return allUnits;
};


/**
 * Update specific unit details for a property/unitNumber pair
 */
export const updateUnitDetails = async (
  propertyId: string,
  unitNumber: string,
  data: Partial<UnitFormData>  
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/units/${propertyId}/${unitNumber}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      console.error(
        `API Error: ${response.status} ${response.statusText} for ${response.url}`
      );
      throw new Error("Failed to update unit");
    }

    const resData = await response.json();
    return { success: true, message: resData.message || "Unit updated" };
  } catch (error: any) {
    console.error("updateUnitDetails:", error);
    return { success: false, message: error.message || "Update failed" };
  }
};


export const fetchUnitDetails = async (propertyId: string, unitNumber: string, p0: boolean) => {
  try {
    const response = await fetch(`/api/units/${propertyId}/${unitNumber}`);

    if (!response.ok) {
      console.error(
        `API Error: ${response.status} ${response.statusText} for /api/units/${propertyId}/${unitNumber}`
      );
      throw new Error("Failed to fetch unit details");
    }

    return await response.json();
  } catch (error) {
    console.error("fetchUnitDetails:", error);
    return null;
  }
};
