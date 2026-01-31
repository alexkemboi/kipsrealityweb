import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PropertyImageData {
  url: string;
  publicId?: string;
  order?: number;
  width?: number;
  height?: number;
  format?: string;
}

function extractCloudinaryPublicId(url: string): string | null {
  try {
    const uploadIdx = url.indexOf("/upload/");
    if (uploadIdx === -1) return null;

    // Everything after /upload/
    let rest = url.slice(uploadIdx + "/upload/".length);

    // Strip version segment if present (v12345/)
    rest = rest.replace(/^v\d+\//, "");

    // Strip querystring and extension
    rest = rest.split("?")[0] ?? rest;
    rest = rest.replace(/\.[a-zA-Z0-9]+$/, "");

    return rest || null;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const body = await request.json();
    const { images } = body as { images: PropertyImageData[] };

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

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Save all images to database
    const savedImages = await prisma.$transaction(
      images.map((image) =>
        prisma.propertyImage.create({
          data: {
            propertyId,
            url: image.url,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Images saved to database successfully",
      images: savedImages,
    });
  } catch (error: any) {
    console.error("Error saving images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save images to database" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint to retrieve property images
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;

    const images = await prisma.propertyImage.findMany({
      where: { propertyId },
    });

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error: any) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch images" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Optional: DELETE endpoint to remove images
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const { imageId } = await request.json();

    if (imageId) {
      // Delete specific image
      const image = await prisma.propertyImage.findUnique({
        where: { id: imageId },
      });

      if (image) {
        // Delete from Cloudinary (best-effort; publicId is derived from url)
        const cloudinary = require("cloudinary").v2;
        const publicId = extractCloudinaryPublicId(image.url);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }

        // Delete from database
        await prisma.propertyImage.delete({
          where: { id: imageId },
        });
      }
    } else {
      // Delete all property images
      const images = await prisma.propertyImage.findMany({
        where: { propertyId },
      });

      const cloudinary = require("cloudinary").v2;
      await Promise.all(
        images.map((img) => {
          const publicId = extractCloudinaryPublicId(img.url);
          return publicId ? cloudinary.uploader.destroy(publicId) : Promise.resolve();
        })
      );

      await prisma.propertyImage.deleteMany({
        where: { propertyId },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Images deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete images" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}