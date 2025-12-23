import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PropertyImageData {
  url: string;
  publicId: string;
  order: number;
  width: number;
  height: number;
  format: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { propertyId } = params;
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
            publicId: image.publicId,
            order: image.order,
            width: image.width,
            height: image.height,
            format: image.format,
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
  { params }: { params: { propertyId: string } }
) {
  try {
    const { propertyId } = params;

    const images = await prisma.propertyImage.findMany({
      where: { propertyId },
      orderBy: { order: "asc" },
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
  { params }: { params: { propertyId: string } }
) {
  try {
    const { propertyId } = params;
    const { imageId } = await request.json();

    if (imageId) {
      // Delete specific image
      const image = await prisma.propertyImage.findUnique({
        where: { id: imageId },
      });

      if (image) {
        // Delete from Cloudinary
        const cloudinary = require("cloudinary").v2;
        await cloudinary.uploader.destroy(image.publicId);

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
        images.map((img) => cloudinary.uploader.destroy(img.publicId))
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