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
      bathrooms: null,
      floorNumber: null,
      rentAmount: null,
      isOccupied: false,
    }, { status: 200 }); // return placeholder instead of 404
  }

  return NextResponse.json(unit);
}

export async function PUT(req: Request, context: { params: Promise<{ propertyId: string; unitNumber: string }> }) {
  const { propertyId, unitNumber } = await context.params;
  const data = await req.json();

  // Try to find existing unit
  let unit = await prisma.unit.findFirst({
    where: { propertyId, unitNumber },
  });

  if (!unit) {
    // Create new unit if it doesn't exist
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
      },
    });
  } else {
    // Update existing unit
    unit = await prisma.unit.update({
      where: { id: unit.id },
      data: {
        unitName: data.unitName ?? undefined,
        bedrooms: data.bedrooms ?? undefined,
        bathrooms: data.bathrooms ?? undefined,
        floorNumber: data.floorNumber ?? undefined,
        rentAmount: data.rentAmount ?? undefined,
        isOccupied: data.isOccupied ?? undefined,
      },
    });
  }

  return NextResponse.json({ success: true, message: "Unit saved", unit });
}
