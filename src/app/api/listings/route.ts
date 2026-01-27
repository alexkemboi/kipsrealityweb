import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      organizationId,
      createdBy,
      locationId,
      propertyId,
      unitId,
      title,
      description,
      price,
    } = body;
    let { statusId } = body;

    // ✅ Validate essential fields
    if (!organizationId || !createdBy || !title || !description || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

   // ✅ STEP 1 — AUTO-CREATE DEFAULT CATEGORY IF MISSING

// ✅ STEP 2 — Assign default listing type if missing



    // ✅ STEP 3 — Assign default status if missing
    if (!statusId) {
      let defaultStatus = await prisma.listingStatus.findFirst({
        where: { name: "Active" },
      });

      if (!defaultStatus) {
        defaultStatus = await prisma.listingStatus.create({
          data: { id: crypto.randomUUID(), name: "Active" },
        });
      }

      statusId = defaultStatus.id;
    }

    // ✅ STEP 4 — Create the Listing
    const listing = await prisma.listing.create({
      data: {
        organizationId,
        createdBy,
       
        statusId,
        locationId: locationId ?? null,
        propertyId,
        unitId,
        title,
        description,
        price,
      },
    });

    return NextResponse.json(
      { message: "Listing created successfully", listing },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("CREATE LISTING ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create listing", details: errorMessage },
      { status: 500 }
    );
  }
}
