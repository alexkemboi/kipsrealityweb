import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ propertyId: string; unitNumber: string }> }
) {
  try {
    const { propertyId, unitNumber } = await params;
    const data = await req.json();

    // 1️⃣ Find the unit by propertyId + unitNumber
    const unit = await prisma.unit.findFirst({
      where: { propertyId, unitNumber },
    });

    if (!unit) {
      return NextResponse.json(
        { success: false, message: "Unit not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Handle appliances as an array
    let appliancesToConnect = undefined;

    if (Array.isArray(data.appliances) && data.appliances.length > 0) {
      // Create new appliance entries for each name
      const createdAppliances = await Promise.all(
        data.appliances.map(async (a: { name: string }) => {
          const appliance = await prisma.appliance.create({
            data: {
              name: a.name,
              description: `Appliance "${a.name}" included in unit ${unit.unitNumber}`,
            },
          });
          return appliance;
        })
      );

      // Prepare array for Prisma connect
      appliancesToConnect = createdAppliances.map((a) => ({ id: a.id }));
    }

    // 3️⃣ Update the unit
    const updatedUnit = await prisma.unit.update({
      where: { id: unit.id },
      data: {
        unitName: data.unitName ?? undefined,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
        floorNumber: data.floorNumber ? Number(data.floorNumber) : null,
        rentAmount: data.rentAmount ? Number(data.rentAmount) : null,
        isOccupied:
          typeof data.isOccupied === "boolean" ? data.isOccupied : undefined,

        ...(appliancesToConnect && {
          appliances: {
            set: [], // clear old ones
            connect: appliancesToConnect,
          },
        }),
      },
      include: { appliances: true },
    });

    return NextResponse.json({
      success: true,
      message: "Unit updated successfully with new appliances",
      updatedUnit,
    });
  } catch (error) {
    console.error("PUT /units error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string; unitNumber: string }> }
) {
  try {
    const { propertyId, unitNumber } = await params;

    const unit = await prisma.unit.findFirst({
      where: { propertyId, unitNumber },
      include: {
        appliances: true,
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
