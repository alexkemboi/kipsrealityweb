import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      applicationId,
      tenantId,
      propertyId,
      unitId,
      startDate,
      endDate,
      rentAmount,
      securityDeposit,
      leaseTerm,
      paymentDueDay,
      paymentFrequency,
      lateFeeFlat,
      lateFeeDaily,
      gracePeriodDays,
      landlordResponsibilities,
      tenantResponsibilities,
      tenantPaysElectric,
      tenantPaysWater,
      tenantPaysTrash,
      tenantPaysInternet,
      usageType,
      earlyTerminationFee,
      terminationNoticeDays
    } = data;

    // Basic validation
    if (!applicationId || !propertyId || !unitId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check application
    const app = await prisma.tenantapplication.findUnique({
      where: { id: applicationId },
      include: { property: true, unit: true },
    });

    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (app.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Application must be approved before creating a lease" },
        { status: 400 }
      );
    }

    // Check duplicate lease
    const leaseExists = await prisma.lease.findUnique({
      where: { applicationId },
    });

    if (leaseExists) {
      return NextResponse.json(
        { error: "Lease already exists for this application" },
        { status: 409 }
      );
    }

    // Create lease
    const lease = await prisma.lease.create({
      data: {
        applicationId,
        tenantId: tenantId ?? null,
        propertyId,
        unitId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount,
        securityDeposit: securityDeposit ?? null,
        leaseTerm,
        paymentDueDay,
        paymentFrequency,
        lateFeeFlat,
        lateFeeDaily,
        gracePeriodDays,
        landlordResponsibilities,
        tenantResponsibilities,
        tenantPaysElectric,
        tenantPaysWater,
        tenantPaysTrash,
        tenantPaysInternet,
        usageType,
        earlyTerminationFee,
        terminationNoticeDays,
      },
      include: {
        tenant: true,
        property: true,
        unit: true,
        application: true,
      }
    });

    return NextResponse.json(lease, { status: 201 });

  } catch (error: any) {
    console.error("Lease creation error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// export async function GET(req: NextRequest) {
//   try {
//     const user = await getCurrentUser();

//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Fetch all leases where user is the property manager
//     const leases = await prisma.lease.findMany({
//       where: {
//         property: {
//           managerId: user.id,
//         },
//       },
//       include: {
//         tenant: {
//           select: {
//             id: true,
//             email: true,
//           },
//         },
//         property: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//         unit: {
//           select: {
//             id: true,
//             unitNumber: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json(leases);
//   } catch (error) {
//     console.error("Error fetching leases:", error);
//     return NextResponse.json({ error: "Failed to fetch leases" }, { status: 500 });
//   }
// }
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leases = await prisma.lease.findMany({
      where: {
        property: {
          manager: {
            userId: user.id // ✅ Correct relationship
          }
        }
      },
      include: {
        tenant: true,
        property: true,
        unit: true,
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    return NextResponse.json(leases);
  } catch (error) {
    console.error("Error fetching leases:", error);
    return NextResponse.json({ error: "Failed to fetch leases" }, { status: 500 });
  }
}
