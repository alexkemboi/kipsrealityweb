import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function PUT(req: Request, { params }: { params: { propertyId: string; unitNumber: string } }) {
  try {
    const { propertyId, unitNumber } = params;
    const data = await req.json();

    // Find the unit first by propertyId + unitNumber
    const unit = await prisma.unit.findFirst({
      where: { propertyId, unitNumber },
    });

    if (!unit) {
      return NextResponse.json({ success: false, message: "Unit not found" }, { status: 404 });
    }

    // Parse numeric fields
    const updatedUnit = await prisma.unit.update({
      where: { id: unit.id },
      data: {
        unitName: data.unitName || undefined,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
        floorNumber: data.floorNumber ? Number(data.floorNumber) : null,
        rentAmount: data.rentAmount ? Number(data.rentAmount) : null,
        isOccupied:
      typeof data.isOccupied === "boolean"
        ? data.isOccupied
        : undefined,
      },
    });

    return NextResponse.json({ success: true, message: "Unit details updated", updatedUnit });
  } catch (error) {
    console.error("PUT /units error:", error);
    return NextResponse.json({ success: false, message: "Server error", error: String(error) }, { status: 500 });
  }
}


export async function GET(
  req: Request,
  { params }: { params: { propertyId: string; unitNumber: string } }
) {
  const { propertyId, unitNumber } = params;

  try {
    const unit = await prisma.unit.findFirst({
      where: {
        propertyId,
        unitNumber,
      },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json(unit, { status: 200 });
  } catch (error) {
    console.error("Error fetching unit details:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit details" },
      { status: 500 }
    );
  }
}