//src/lib/property-manager.ts
import { Property, ApartmentComplexDetail, HouseDetail } from "@/app/data/PropertyData";

export type PropertyPayload = Property & {
  propertyDetails?: ApartmentComplexDetail | HouseDetail;
  manager?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    orgUserId: string;      // <- Add orgUserId
    organizationId: string; // <- Add organizationId
  };
};

export const postProperty = async (propertyData: PropertyPayload) => {
  try {
    // Ensure we have a valid managerId and organizationId
    if (!propertyData.manager?.orgUserId || !propertyData.manager?.organizationId) {
      throw new Error("Manager or organization info is missing. Make sure you are logged in.");
    }

    const payload = {
      ...propertyData,
      managerId: propertyData.manager.orgUserId,      // Prisma FK
      organizationId: propertyData.manager.organizationId, // Prisma FK
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/propertymanager`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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


export const getProperties = async (
  managerId?: string,
  organizationId?: string
): Promise<PropertyPayload[]> => {
  try {
    const params = new URLSearchParams();
    if (managerId) params.append('managerId', managerId);
    if (organizationId) params.append('organizationId', organizationId);

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/propertymanager${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const res = await fetch(url, { method: "GET", cache: "no-store" });

    if (!res.ok) {
      throw new Error("Failed to fetch properties");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};


export const getPropertyById = async (id: string): Promise<PropertyPayload> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/propertymanager/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error("Failed to fetch property");
    }

    const property = await response.json();

    const propertyPayload: PropertyPayload = {
      ...property,
      propertyDetails: property.details || undefined,
    };

    return propertyPayload;
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    throw error;
  }
};