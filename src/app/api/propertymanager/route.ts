// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { Prisma } from "@prisma/client";
// import { verifyAccessToken } from "@/lib/auth";

// // ✅ Create Property
// export async function POST(req: Request) {
//   try {
//     // 🔒 Verify access token
//     const authHeader = req.headers.get("authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json(
//         { error: "Unauthorized: Missing or invalid token." },
//         { status: 401 }
//       );
//     }

//     const token = authHeader.split(" ")[1];
//     const payload = verifyAccessToken(token);

//     if (!payload || !payload.userId) {
//       return NextResponse.json(
//         { error: "Invalid token payload. Missing user ID." },
//         { status: 401 }
//       );
//     }

//     const managerId = payload.userId;
//     const data = await req.json();

//     const {
//       listingId,
//       name,
//       organizationId,
//       propertyTypeId,
//       locationId,
//       city,
//       address,
//       amenities,
//       isFurnished,
//       availabilityStatus,
//       propertyDetails,
//     } = data;

//     // ✅ Validate property type
//     const propertyType = await prisma.propertyType.findUnique({
//       where: { id: propertyTypeId },
//     });
//     if (!propertyType) {
//       return NextResponse.json(
//         { error: "Invalid property type ID provided." },
//         { status: 400 }
//       );
//     }

//     // ✅ Validate organization
//     if (!organizationId) {
//       return NextResponse.json(
//         { error: "Organization ID is required for creating a property." },
//         { status: 400 }
//       );
//     }

//     const orgExists = await prisma.organization.findUnique({
//       where: { id: organizationId },
//     });
//     if (!orgExists) {
//       return NextResponse.json(
//         { error: "Organization not found for given organizationId." },
//         { status: 400 }
//       );
//     }

//     // ✅ Find OrganizationUser (manager)
//     const orgUser = await prisma.organizationUser.findFirst({
//       where: {
//         userId: managerId,
//         organizationId: organizationId,
//       },
//     });

//     if (!orgUser) {
//       return NextResponse.json(
//         {
//           error:
//             "No OrganizationUser record found for this manager and organization. Please ensure the manager is linked to the organization.",
//         },
//         { status: 400 }
//       );
//     }

//     // ✅ Convert amenities array to JSON string or null
//     const amenitiesValue = amenities && Array.isArray(amenities) && amenities.length > 0
//       ? JSON.stringify(amenities)
//       : null;

//     // ✅ Create the property
//     const property = await prisma.property.create({
//       data: {
//         listingId,
//         name,
//         city,
//         address,
//         amenities: amenitiesValue, // ✅ Store as JSON string
//         isFurnished,
//         availabilityStatus,
//         propertyType: { connect: { id: propertyTypeId } },
//         organization: { connect: { id: organizationId } },
//         manager: { connect: { id: orgUser.id } },
//         ...(locationId && { location: { connect: { id: locationId } } }),
//       },
//       include: {
//         organization: true,
//         manager: { include: { user: true } },
//         propertyType: true,
//       },
//     });

//     // ✅ Add property details if applicable
//     if (propertyType.name.toLowerCase() === "apartment") {
//       await prisma.apartmentComplexDetail.create({
//         data: {
//           propertyId: property.id,
//           buildingName: propertyDetails?.buildingName || null,
//           totalFloors: propertyDetails?.totalFloors || null,
//           totalUnits: propertyDetails?.totalUnits || null,
//         },
//       });
//     } else if (propertyType.name.toLowerCase() === "house") {
//       await prisma.houseDetail.create({
//         data: {
//           propertyId: property.id,
//           numberOfFloors: propertyDetails?.numberOfFloors || null,
//           bedrooms: propertyDetails?.bedrooms || null,
//           bathrooms: propertyDetails?.bathrooms || null,
//           size: propertyDetails?.size || null,
//         },
//       });
//     }

//     // ✅ Return structured success response
//     return NextResponse.json(
//       {
//         message: "Property created successfully.",
//         property: {
//           id: property.id,
//           name: property.name,
//           city: property.city,
//           address: property.address,
//           type: property.propertyType?.name,
//           organization: property.organization
//             ? { id: property.organization.id, name: property.organization.name }
//             : null,
//           manager: property.manager
//             ? {
//                 id: property.manager.id,
//                 name: `${property.manager.user.firstName || ""} ${
//                   property.manager.user.lastName || ""
//                 }`.trim(),
//                 email: property.manager.user.email,
//               }
//             : null,
//           isFurnished: property.isFurnished,
//           availabilityStatus: property.availabilityStatus,
//           amenities: property.amenities ? JSON.parse(property.amenities) : [],
//           createdAt: property.createdAt,
//         },
//       },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.error("❌ Error creating property:", error);
//     return NextResponse.json(
//       { error: "Failed to create property.", details: error.message },
//       { status: 500 }
//     );
//   }
// }
// // ✅ Fetch All Properties with Relations
// export async function GET() {
//   try {
//     type PropertyWithRelations = Prisma.PropertyGetPayload<{
//       include: {
//         organization: true;
//         manager: { include: { user: true } };
//         propertyType: true;
//         apartmentComplexDetail: true;
//         houseDetail: true;
//         units: true;
//       };
//     }>;

//     const properties: PropertyWithRelations[] = await prisma.property.findMany({
//       include: {
//         organization: true,
//         manager: { include: { user: true } },
//         propertyType: true,
//         apartmentComplexDetail: true,
//         houseDetail: true,
//         units: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     const formatted = properties.map((p) => ({
//       id: p.id,
//       name: p.name,
//       city: p.city,
//       address: p.address,
//       type: p.propertyType?.name,
//       organization: p.organization
//         ? { id: p.organization.id, name: p.organization.name }
//         : null,
//       manager: p.manager
//         ? {
//             id: p.manager.id,
//             name: `${p.manager.user.firstName || ""} ${
//               p.manager.user.lastName || ""
//             }`.trim(),
//             email: p.manager.user.email,
//           }
//         : null,
//       isFurnished: p.isFurnished,
//       availabilityStatus: p.availabilityStatus,
//       details:
//         p.propertyType?.name.toLowerCase() === "apartment"
//           ? p.apartmentComplexDetail
//           : p.houseDetail,
//       totalUnits: p.units?.length || 0,
//       createdAt: p.createdAt,
//     }));

//     return NextResponse.json(formatted, { status: 200 });
//   } catch (error: any) {
//     console.error("❌ Error fetching properties:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch properties", details: error.message },
//       { status: 500 }
//     );
//   }
// }
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const tx = prisma.$transaction; // for safety in case something fails

  try {
    const data = await req.json();

    const {
      listingId,
      managerId,
      name,
      organizationId,
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
      propertyDetails, // contains either apartmentComplexDetail or houseDetail info
    } = data;

    //  Validate property type
    const propertyType = await prisma.propertyType.findUnique({
      where: { id: propertyTypeId },
    });

    if (!propertyType) {
      return NextResponse.json(
        { error: 'Invalid property type' },
        { status: 400 }
      );
    }

    //  Create everything in a single transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1 Create the property
      const property = await tx.property.create({
        data: {
          listingId,
          managerId,
          name,
          organizationId,
          propertyTypeId,
          locationId,
          city,
          address,
          amenities,
          isFurnished,
          availabilityStatus,
        },
      });

      // 2 Handle apartment type
      if (propertyType.name.toLowerCase() === 'apartment') {
        const complex = await tx.apartmentComplexDetail.create({
          data: {
            propertyId: property.id,
            buildingName: propertyDetails?.buildingName || null,
            totalFloors: propertyDetails?.totalFloors || null,
            totalUnits: propertyDetails?.totalUnits || null,
          },
        });

        // 3 If totalUnits is set, generate empty unit records
        const totalUnits = propertyDetails?.totalUnits ?? 0;
        const unitsData = [];

        for (let i = 1; i <= totalUnits; i++) {
          unitsData.push({
            propertyId: property.id,
            complexDetailId: complex.id,
            unitNumber: `${i}`, // store as string since Prisma model uses String
          });
        }

        if (unitsData.length > 0) {
          await tx.unit.createMany({
            data: unitsData,
          });
        }
      }

      // Handle house type
      else if (propertyType.name.toLowerCase() === 'house') {
        const house = await tx.houseDetail.create({
          data: {
            propertyId: property.id,
            numberOfFloors: propertyDetails?.numberOfFloors || null,
            bedrooms: propertyDetails?.bedrooms || null,
            bathrooms: propertyDetails?.bathrooms || null,
            size: propertyDetails?.size || null,
          },
        });

        // Optionally create a single unit for the house
        await tx.unit.create({
          data: {
            propertyId: property.id,
            houseDetailId: house.id,
            unitNumber: '1',
          },
        });
      }

      return property;
    });

    return NextResponse.json(
      { message: 'Property created successfully', property: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property', details: error.message },
      { status: 500 }
    );
  }
}

// Fetching all properties with details
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        propertyType: true,
        apartmentComplexDetail: true,
        houseDetail: true,
        units: true, 
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = properties.map((p) => ({
      id: p.id,
      name: p.name,
      city: p.city,
      address: p.address,
      type: p.propertyType?.name,
      isFurnished: p.isFurnished,
      availabilityStatus: p.availabilityStatus,
      details: p.propertyType?.name.toLowerCase() === "apartment"
        ? p.apartmentComplexDetail
        : p.houseDetail,
      totalUnits: p.units?.length || 0,
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
      id, // property ID to update
      listingId,
      managerId,
      name,
      organizationId,
      propertyTypeId,
      locationId,
      city,
      address,
      amenities,
      isFurnished,
      availabilityStatus,
      propertyDetails, // apartmentComplexDetail or houseDetail
    } = data;

    // 1️⃣ Ensure propertyTypeId exists
    if (!propertyTypeId) {
      return NextResponse.json(
        { error: "Invalid property type" },
        { status: 400 }
      );
    }

    // 2️⃣ Fetch the property type
    const propertyType = await prisma.propertyType.findUnique({
      where: { id: propertyTypeId },
    });

    if (!propertyType) {
      return NextResponse.json(
        { error: "Property type not found" },
        { status: 400 }
      );
    }

    // 3️⃣ Update in a transaction for safety
    const updatedProperty = await prisma.$transaction(async (tx) => {
      // Update main property fields
      const property = await tx.property.update({
        where: { id },
        data: {
          listingId,
          managerId,
          name,
          organizationId,
          propertyTypeId,
          locationId,
          city,
          address,
          amenities,
          isFurnished,
          availabilityStatus,
        },
      });

      // Update apartment or house details
      if (propertyType.name.toLowerCase() === "apartment") {
        // Update or create apartmentComplexDetail
        const existingComplex = await tx.apartmentComplexDetail.findUnique({
          where: { propertyId: property.id },
        });

        if (existingComplex) {
          await tx.apartmentComplexDetail.update({
            where: { propertyId: property.id },
            data: {
              buildingName: propertyDetails?.buildingName ?? existingComplex.buildingName,
              totalFloors: propertyDetails?.totalFloors ?? existingComplex.totalFloors,
              totalUnits: propertyDetails?.totalUnits ?? existingComplex.totalUnits,
            },
          });
        } else {
          await tx.apartmentComplexDetail.create({
            data: {
              propertyId: property.id,
              buildingName: propertyDetails?.buildingName ?? null,
              totalFloors: propertyDetails?.totalFloors ?? null,
              totalUnits: propertyDetails?.totalUnits ?? null,
            },
          });
        }
      } else if (propertyType.name.toLowerCase() === "house") {
        const existingHouse = await tx.houseDetail.findUnique({
          where: { propertyId: property.id },
        });

        if (existingHouse) {
          await tx.houseDetail.update({
            where: { propertyId: property.id },
            data: {
              numberOfFloors: propertyDetails?.numberOfFloors ?? existingHouse.numberOfFloors,
              bedrooms: propertyDetails?.bedrooms ?? existingHouse.bedrooms,
              bathrooms: propertyDetails?.bathrooms ?? existingHouse.bathrooms,
              size: propertyDetails?.size ?? existingHouse.size,
            },
          });
        } else {
          await tx.houseDetail.create({
            data: {
              propertyId: property.id,
              numberOfFloors: propertyDetails?.numberOfFloors ?? null,
              bedrooms: propertyDetails?.bedrooms ?? null,
              bathrooms: propertyDetails?.bathrooms ?? null,
              size: propertyDetails?.size ?? null,
            },
          });
        }
      }

      return property;
    });

    return NextResponse.json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error: any) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property", details: error.message },
      { status: 500 }
    );
  }
}


// ❌ DELETE PROPERTY
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing property ID' }, { status: 400 });
    }

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Delete dependent records in safe order
      await tx.unit.deleteMany({ where: { propertyId: id } });
      await tx.apartmentComplexDetail.deleteMany({ where: { propertyId: id } });
      await tx.houseDetail.deleteMany({ where: { propertyId: id } });
      await tx.property.delete({ where: { id } });
    });

    return NextResponse.json(
      { message: 'Property deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property', details: error.message },
      { status: 500 }
    );
  }
}