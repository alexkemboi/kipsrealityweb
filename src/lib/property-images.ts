// src/lib/property-images.ts
interface PropertyImage {
  url: string;
  publicId: string;
  order: number;
  width: number;
  height: number;
  format: string;
}

export async function savePropertyImages(
  propertyId: string,
  images: PropertyImage[]
) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/property-post/${propertyId}/images`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ images }),
    });

    if (!response.ok) {
      throw new Error("Failed to save images to database");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving images:", error);
    throw error;
  }
}