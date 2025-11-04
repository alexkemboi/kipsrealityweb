import { Property } from "@/app/data/PropertyData"; 

export const fetchProperty = async (): Promise<Property[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/my-property`, {
   next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} for ${response.url}`);
      throw new Error("Failed to fetch Propertys");
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("fetchProperty:", error);
    return [];
  }
};
