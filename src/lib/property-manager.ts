import { Property, ApartmentComplexDetail, HouseDetail } from "@/app/data/PropertyData";

type PropertyPayload = Property & {
  propertyDetails?: ApartmentComplexDetail | HouseDetail;
};

export const postProperty = async (propertyData: PropertyPayload) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/property-manager`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error("Failed to post property");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error posting property:", error);
    throw error;
  }
};
