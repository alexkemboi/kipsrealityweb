

// src/app/api/propertymanager/route.ts
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      listingId,
      managerId,
      name,
      propertyTypeId,
      locationId,
      city,
      address,
      amenities,
      isFurnished,
      availabilityStatus,
      propertyDetails, // contains apartmentComplexDetail or houseDetail info
    } = data;

    // Validate managerId
    if (!managerId) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 }
      );
    }

    // Fetch manager from DB
    const orgUser = await prisma.organizationUser.findUnique({
      where: { id: managerId },
    });

    if (!orgUser) {
      return NextResponse.json(
        { error: "Invalid managerId" },
        { status: 400 }
      );
    }

    // Validate property type
    const propertyType = await prisma.propertyType.findUnique({
      where: { id: propertyTypeId },
    });

    if (!propertyType) {
      return NextResponse.json(
        { error: "Invalid propertyTypeId" },
        { status: 400 }
      );
    }

    // Transaction: create property + details + units
    const property = await prisma.$transaction(async (tx) => {
      // 1. Create property
      const prop = await tx.property.create({
        data: {
          listingId,
          managerId: orgUser.id,
          organizationId: orgUser.organizationId, // FK from manager
          name,
          propertyTypeId,
          locationId,
          city,
          address,
          amenities,
          isFurnished,
          availabilityStatus,
        },
      });

      // 2. Apartment handling
      if (propertyType.name.toLowerCase() === "apartment" && propertyDetails) {
        const complex = await tx.apartmentComplexDetail.create({
          data: {
            propertyId: prop.id,
            buildingName: propertyDetails.buildingName || null,
            totalFloors: propertyDetails.totalFloors || null,
            totalUnits: propertyDetails.totalUnits || null,
          },
        });

        const totalUnits = propertyDetails.totalUnits ?? 0;
        if (totalUnits > 0) {
          const unitsData = Array.from({ length: totalUnits }, (_, i) => ({
            propertyId: prop.id,
            complexDetailId: complex.id,
            unitNumber: `${i + 1}`,
          }));
          await tx.unit.createMany({ data: unitsData });
        }
      }

      else if (propertyType.name.toLowerCase() === "house" && propertyDetails) {
        const house = await tx.houseDetail.create({
          data: {
            propertyId: prop.id,
            numberOfFloors: propertyDetails.numberOfFloors || null,
            bedrooms: propertyDetails.bedrooms || null,
            houseName: propertyDetails.houseName || null,
            bathrooms: propertyDetails.bathrooms || null,
            size: propertyDetails.size || null,
            totalUnits: propertyDetails.totalUnits || null, // Store totalUnits
          },
        });

        // Create multiple units for house based on totalUnits
 const totalUnits = propertyDetails.totalUnits ?? 1; // FIX: Default to 1 if not provided
        console.log(`Creating ${totalUnits} units for house property`); // Debug log
                if (totalUnits > 0) {
          const unitsData = Array.from({ length: totalUnits }, (_, i) => ({
            propertyId: prop.id,
            houseDetailId: house.id,
            unitNumber: `${i + 1}`,
          }));
          await tx.unit.createMany({ data: unitsData });
        }
      }

      return prop;
    });

    return NextResponse.json(
      { message: "Property created successfully", property },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property", details: error.message },
      { status: 500 }
    );
  }
}


export async function GET(req: Request) {
  try {
    // Pass the req to getCurrentUser
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build where clause based on role/org
    const whereClause: any = {};

    if (user.role === "PROPERTY_MANAGER") {
      whereClause.managerId = user.organizationUserId;
    }

    if (user.organizationId) {
      whereClause.organizationId = user.organizationId;
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        propertyType: true,
        apartmentComplexDetail: true,
        houseDetail: true,
        units: { include: { appliances: true } },
        manager: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format response
    const formatted = properties.map((p) => ({
      id: p.id,
      name: p.name,
      city: p.city,
      address: p.address,
      type: p.propertyType?.name || null,
      isFurnished: p.isFurnished,
      availabilityStatus: p.availabilityStatus,
      details:
        p.propertyType?.name.toLowerCase() === "apartment"
          ? p.apartmentComplexDetail
          : p.houseDetail,
      totalUnits: p.units?.length || 0,
      manager: p.manager
        ? {
            id: p.manager.user.id,
            email: p.manager.user.email,
            firstName: p.manager.user.firstName,
            lastName: p.manager.user.lastName,
            role: p.manager.role,
          }
        : null,
      organization: p.organization || null,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties", details: error.message },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const {
      id, // Property ID
      name,
      city,
      address,
      locationId,
      amenities,
      isFurnished,
      availabilityStatus,
      propertyDetails,
    } = data;

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyType: true,
        apartmentComplexDetail: true,
        houseDetail: true,
        units: true, // Include units to manage unit count changes
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (!property.propertyType) {
      throw new Error("Property type is missing or invalid.");
    }

    const type = property.propertyType.name.toLowerCase();

    const updated = await prisma.$transaction(async (tx) => {
      // ----- Update Main Property -----
      const updatedProperty = await tx.property.update({
        where: { id },
        data: {
          name,
          city,
          address,
          locationId,
          amenities,
          isFurnished,
          availabilityStatus,
        },
      });

      // ===== Update Apartment Details =====
      if (type === "apartment") {
        await tx.apartmentComplexDetail.update({
          where: { propertyId: id },
          data: {
            buildingName: propertyDetails?.buildingName ?? null,
            totalFloors: propertyDetails?.totalFloors ?? null,
            totalUnits: propertyDetails?.totalUnits ?? null,
          },
        });
      }

      // ===== Update House Details =====
      else if (type === "house") {
        await tx.houseDetail.update({
          where: { propertyId: id },
          data: {
            houseName: propertyDetails?.houseName ?? null,
            numberOfFloors: propertyDetails?.numberOfFloors ?? null,
            bathrooms: propertyDetails?.bathrooms ?? null,
            bedrooms: propertyDetails?.bedrooms ?? null,
            size: propertyDetails?.size ?? null,
            totalUnits: propertyDetails?.totalUnits ?? null, // Update totalUnits
          },
        });

        // Handle unit count changes for houses
        if (propertyDetails?.totalUnits !== undefined) {
          const currentUnitCount = property.units.length;
          const newUnitCount = propertyDetails.totalUnits;

          if (newUnitCount > currentUnitCount) {
            // Add new units
            const unitsToAdd = newUnitCount - currentUnitCount;
            const unitsData = Array.from({ length: unitsToAdd }, (_, i) => ({
              propertyId: id,
              houseDetailId: property.houseDetail?.id,
              unitNumber: `${currentUnitCount + i + 1}`,
            }));
            await tx.unit.createMany({ data: unitsData });
          } else if (newUnitCount < currentUnitCount) {
            // Remove excess units (remove from the end)
            const unitsToRemove = currentUnitCount - newUnitCount;
            const unitsToDelete = property.units
              .sort((a, b) => parseInt(b.unitNumber) - parseInt(a.unitNumber))
              .slice(0, unitsToRemove);
            
            for (const unit of unitsToDelete) {
              await tx.unit.delete({ where: { id: unit.id } });
            }
          }
        }
      }

      return updatedProperty;
    });

    return NextResponse.json(
      { message: "Property updated successfully", property: updated },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property", details: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Delete units first
      await tx.unit.deleteMany({ where: { propertyId: id } });

      // Remove details (both types just in case)
      await tx.apartmentComplexDetail.deleteMany({ where: { propertyId: id } });
      await tx.houseDetail.deleteMany({ where: { propertyId: id } });

      // Delete final property
      await tx.property.delete({ where: { id } });
    });

    return NextResponse.json(
      { message: "Property deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property", details: error.message },
      { status: 500 }
    );
  }
}
