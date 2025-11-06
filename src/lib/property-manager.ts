// import { Property, ApartmentComplexDetail, HouseDetail } from "@/app/data/PropertyData";

// type PropertyPayload = {
//   name: string;
//   propertyTypeId: string;
//   organizationId: string;
//   city: string;
//   address: string;
//   locationId?: string;
//   amenities?: string[];
//   isFurnished?: boolean;
//   availabilityStatus?: string;
//   propertyDetails?: {
//     // For apartments
//     buildingName?: string;
//     totalFloors?: number;
//     totalUnits?: number;
//     // For houses
//     numberOfFloors?: number;
//     bedrooms?: number;
//     bathrooms?: number;
//     size?: number;
//   };
// };

// // ✅ Helper: Refresh access token if expired
// async function refreshAccessToken(): Promise<string | null> {
//   try {
//     const refreshToken = localStorage.getItem("refreshToken");
//     if (!refreshToken) return null;

//     const res = await fetch("/api/auth/refresh", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ refreshToken }),
//     });

//     if (!res.ok) throw new Error("Failed to refresh token");

//     const data = await res.json();
//     if (data.accessToken) {
//       localStorage.setItem("accessToken", data.accessToken);
//       return data.accessToken;
//     }

//     return null;
//   } catch (err) {
//     console.error("Error refreshing token:", err);
//     return null;
//   }
// }

// // ✅ Create Property (POST)
// export async function postProperty(data: PropertyPayload, authToken?: string) {
//   let token = authToken || localStorage.getItem("accessToken");

//   if (!token) {
//     throw new Error("No authentication token found. Please log in.");
//   }

//   let response = await fetch("/api/propertymanager", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(data),
//   });

//   // If token expired → refresh and retry once
//   if (response.status === 401) {
//     const errorData = await response.json().catch(() => ({ error: "" }));
//     const errorText = errorData.error || "";
    
//     if (errorText.includes("expired") || errorText.includes("invalid token")) {
//       console.warn("🔁 Token expired — refreshing...");
//       const newToken = await refreshAccessToken();

//       if (newToken) {
//         token = newToken;
//         response = await fetch("/api/propertymanager", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${newToken}`,
//           },
//           body: JSON.stringify(data),
//         });
//       } else {
//         throw new Error("Session expired. Please log in again.");
//       }
//     }
//   }

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     const errorMessage = errorData.error || errorData.details || "Failed to create property";
//     console.error(`API Error: ${response.status} - ${errorMessage}`);
//     throw new Error(errorMessage);
//   }

//   return await response.json();
// }

// // ✅ Fetch All Properties (GET)
// export const getProperties = async (): Promise<Property[]> => {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/propertymanager`,
//       {
//         method: "GET",
//         cache: "no-store",
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(
//         `API Error: ${response.status} ${response.statusText} - ${errorText}`
//       );
//       throw new Error("Failed to fetch properties");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching properties:", error);
//     throw error;
//   }
// };

import { Property, ApartmentComplexDetail, HouseDetail } from "@/app/data/PropertyData";

export type PropertyPayload = Property & {
  propertyDetails?: ApartmentComplexDetail | HouseDetail;
};

export const postProperty = async (propertyData: PropertyPayload) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/propertymanager`, {
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




export const getProperties = async (): Promise<PropertyPayload[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/propertymanager`, {
      method: "GET",
      cache: "no-store", 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error("Failed to fetch properties");
    }

    const properties = await response.json();
    return properties;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};


export const getPropertyById = async (id: string): Promise<PropertyPayload> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/propertymanager/${id}`);

    if (!response.ok) {
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


export async function updateProperty(id: string, updatedData: Partial<Property>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/propertymanager/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) throw new Error("Failed to update property");
  return res.json();
}

export async function deleteProperty(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/propertymanager/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete property");
  return res.json();
}