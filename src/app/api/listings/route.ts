import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let {
      organizationId,
      createdBy,
      categoryId,
      listingTypeId,
      statusId,
      locationId,
      propertyId,
      unitId,
      title,
      description,
      price,
    } = body;

    // ✅ Validate essential fields
    if (!organizationId || !createdBy || !title || !description || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

   // ✅ STEP 1 — AUTO-CREATE DEFAULT CATEGORY IF MISSING
if (!categoryId) {
  let defaultCategory = await prisma.categoryMarketplace.findFirst({
    where: { name: "Housing" },
  });

  if (!defaultCategory) {
    defaultCategory = await prisma.categoryMarketplace.create({
      data: {
        name: "Housing",   // ✅ slug removed (doesn't exist in your model)
      },
    });
  }

  categoryId = defaultCategory.id;
}

// ✅ STEP 2 — Assign default listing type if missing
if (!listingTypeId) {
  let defaultType = await prisma.listingType.findFirst({
    where: { name: "For Rent" },
  });

  if (!defaultType) {
    defaultType = await prisma.listingType.create({
      data: {
        name: "For Rent",  // ✅ slug removed (not in your model)
      },
    });
  }

  listingTypeId = defaultType.id;
}


    // ✅ STEP 3 — Assign default status if missing
    if (!statusId) {
      let defaultStatus = await prisma.listingStatus.findFirst({
        where: { name: "Active" },
      });

      if (!defaultStatus) {
        defaultStatus = await prisma.listingStatus.create({
          data: { name: "Active" },
        });
      }

      statusId = defaultStatus.id;
    }

    // ✅ STEP 4 — Create the Listing
    const listing = await prisma.listing.create({
      data: {
        organizationId,
        createdBy,
        categoryId,
        listingTypeId,
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
  } catch (error: any) {
    console.error("CREATE LISTING ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create listing", details: error.message },
      { status: 500 }
    );
  }
}
