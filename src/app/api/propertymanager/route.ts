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

// Create a new property
export async function POST(req: Request) {
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

    // Validate property type
    const propertyType = await prisma.propertyType.findUnique({
      where: { id: propertyTypeId },
    });

    if (!propertyType) {
      return NextResponse.json(
        { error: "Invalid property type" },
        { status: 400 }
      );
    }

    // Create the property first
    const property = await prisma.property.create({
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

    // Create details based on property type
    if (propertyType.name.toLowerCase() === "apartment") {
      await prisma.apartmentComplexDetail.create({
        data: {
          propertyId: property.id,
          buildingName: propertyDetails?.buildingName || null,
          totalFloors: propertyDetails?.totalFloors || null,
          totalUnits: propertyDetails?.totalUnits || null,
        },
      });
    } else if (propertyType.name.toLowerCase() === "house") {
      await prisma.houseDetail.create({
        data: {
          propertyId: property.id,
          numberOfFloors: propertyDetails?.numberOfFloors || null,
          bedrooms: propertyDetails?.bedrooms || null,
          bathrooms: propertyDetails?.bathrooms || null,
          size: propertyDetails?.size || null,
        },
      });
    }

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
