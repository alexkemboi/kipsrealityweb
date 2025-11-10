import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const data = await req.json();

  const {
    organizationId,
    managerId,
    propertyTypeId,
    locationId,
    city,
    address,
    bedrooms,
    bathrooms,
    size,
    amenities,
    isFurnished,
    availabilityStatus,
  } = data;

  // ✅ 1. Fetch category for "Property"
  const propertyCategory = await prisma.categoryMarketplace.findUnique({
    where: { name: "Property" },
  });

  if (!propertyCategory) throw new Error("Property category not found");

  // ✅ 2. Create property with nested listing
  const newProperty = await prisma.property.create({
    data: {
      organization: { connect: { id: organizationId } },
      manager: managerId ? { connect: { id: managerId } } : undefined,
      propertyType: propertyTypeId ? { connect: { id: propertyTypeId } } : undefined,
      location: locationId ? { connect: { id: locationId } } : undefined,
      city,
      address,
      isFurnished,
      availabilityStatus,

      listing: {
  create: {
    organizationId,
    createdBy: "466bcb9a-6454-4c61-aace-c87855d89ce4" ,
    title: `${city} Property Listing`,
    description: amenities || "No description provided",
    price: 0,
  },
},
    },
  });

  return NextResponse.json(newProperty, { status: 201 });
}