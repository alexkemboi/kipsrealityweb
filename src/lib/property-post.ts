// src/lib/postProperty.ts
import { Property } from "@/app/data/PropertyData";

export const postProperty = async (propertyData: Property) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/property-post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(propertyData),
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`);
    throw new Error("Failed to post property");
  }

  return response.json();
};
