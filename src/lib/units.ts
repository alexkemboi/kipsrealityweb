// src/lib/units.ts
import { Unit } from "@/app/data/UnitData";

export const fetchUnits = async (propertyId: string): Promise<Unit[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/units?propertyId=${propertyId}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      console.error(
        `API Error: ${response.status} ${response.statusText} for ${response.url}`
      );
      throw new Error("Failed to fetch units");
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("fetchUnits:", error);
    return [];
  }
};





/**
 * Update specific unit details for a property/unitNumber pair
 */
export const updateUnitDetails = async (
  propertyId: string,
  unitNumber: string,
  data: Partial<Unit>
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