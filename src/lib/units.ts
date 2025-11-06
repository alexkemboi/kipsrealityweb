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
