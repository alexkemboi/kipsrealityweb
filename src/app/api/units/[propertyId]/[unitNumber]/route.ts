// src/app/api/units/[propertyId]/[unitNumber]/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ propertyId: string; unitNumber: string }> }) {
  const { propertyId, unitNumber } = await context.params;

  const unit = await prisma.unit.findFirst({
    where: { propertyId, unitNumber },
  });

  if (!unit) {
    return NextResponse.json({
      id: null,
      unitNumber,
      unitName: null,
      bedrooms: null,
      appliances: [],
      bathrooms: null,
      floorNumber: null,
      rentAmount: null,
      isOccupied: false,
    }, { status: 200 }); // return placeholder instead of 404
  }

  return NextResponse.json(unit);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ propertyId: string; unitNumber: string }> }
) {
  const { propertyId, unitNumber } = await context.params;
  const data = await req.json();

  type ApplianceInput = { name: string };
  const applianceArray: ApplianceInput[] =
    typeof data.appliances === "string"
      ? data.appliances
          .split(",")
          .map((name: string) => ({ name: name.trim() }))
      : Array.isArray(data.appliances)
      ? data.appliances.map((a: any) => ({ name: a.name }))
      : [];

  // Find or create the unit
  let unit = await prisma.unit.findFirst({
    where: { propertyId, unitNumber },
  });

  if (!unit) {
    // --- CREATE ---
    // Create appliance records for this new unit
    const createdAppliances = await Promise.all(
      applianceArray.map((a) =>
        prisma.appliance.create({
          data: { name: a.name },
        })
      )
    );

    unit = await prisma.unit.create({
      data: {
        propertyId,
        unitNumber,
        unitName: data.unitName ?? null,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        floorNumber: data.floorNumber ?? null,
        rentAmount: data.rentAmount ?? null,
        isOccupied: data.isOccupied ?? false,
        appliances: {
          connect: createdAppliances.map((a) => ({ id: a.id })),
        },
      },
      include: { appliances: true },
    });
  } else {
    // --- UPDATE ---
    // Create new appliance entries for this unit (duplicates allowed)
    const createdAppliances = await Promise.all(
      applianceArray.map((a) =>
        prisma.appliance.create({
          data: { name: a.name },
        })
      )
    );

    // Update the unit and connect the new appliances
    unit = await prisma.unit.update({
      where: { id: unit.id },
      data: {
        unitName: data.unitName ?? undefined,
        bedrooms: data.bedrooms ?? undefined,
        bathrooms: data.bathrooms ?? undefined,
        floorNumber: data.floorNumber ?? undefined,
        rentAmount: data.rentAmount ?? undefined,
        isOccupied: data.isOccupied ?? undefined,
        appliances: {
          set: [], // Clear old relationships
          connect: createdAppliances.map((a) => ({ id: a.id })), // Connect new ones
        },
      },
      include: { appliances: true },
    });
  }

  return NextResponse.json({ success: true, message: "Unit saved", unit });
}
