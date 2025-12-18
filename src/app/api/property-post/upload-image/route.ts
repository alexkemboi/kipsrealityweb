// src/app/api/property-post/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const propertyId = formData.get("propertyId") as string;
    const images = formData.getAll("images") as File[];
    const orders = formData.getAll("orders") as string[];

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadPromises = images.map(async (file, index) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(base64Image, {
        folder: `properties/${propertyId}`,
        resource_type: "image",
        transformation: [
          { width: 1920, height: 1080, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        order: parseInt(orders[index] || "0"),
        width: result.width,
        height: result.height,
        format: result.format,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // Save to database using relative URL (since we're in Next.js)
    const saveResponse = await fetch(
      `${request.nextUrl.origin}/api/property-post/${propertyId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images: uploadedImages }),
      }
    );

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      throw new Error(errorData.error || "Failed to save images to database");
    }

    const savedData = await saveResponse.json();

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      savedImages: savedData,
      message: `${uploadedImages.length} images uploaded and saved successfully`,
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload images" },
      { status: 500 }
    );
  }
}