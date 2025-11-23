import { Unit } from "@/app/data/UnitData";

export const fetchUnits = async (propertyId: string): Promise<Unit[]> => {
  try {
    const response = await fetch(`/api/properties/${propertyId}/units`);
    if (!response.ok) throw new Error("Failed to fetch units");

    const data = await response.json();
    return data.units || [];
  } catch (error: any) {
    console.error("fetchUnitsClient error:", error);
    return [];
  }
};
