//app/api/lease/route.ts
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

    if (!applicationId || !propertyId || !unitId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure the tenant application exists and is approved
    const app = await prisma.tenantapplication.findUnique({
      where: { id: applicationId },
      include: { property: true, unit: true },
    });

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (app.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Application must be approved before creating a lease" },
        { status: 400 }
      );
    }

    // Prevent duplicate lease for the same application
    const existingLease = await prisma.lease.findUnique({
      where: { applicationId },
    });

    if (existingLease) {
      return NextResponse.json(
        { error: "Lease already exists for this application" },
        { status: 409 }
      );
    }

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
      },
    });

    return NextResponse.json(lease, { status: 201 });
  } catch (error: any) {
    console.error("Lease creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const propertyId = url.searchParams.get("propertyId");

    const where: any = {
      property: {
        manager: {
          userId: user.id,
        },
      },
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    // Final merged + fixed query
    const leases = await prisma.lease.findMany({
      where,
      include: {
        tenant: true,
        property: {
          include: {
            apartmentComplexDetail: true,   
            houseDetail: true
          }
        },
         unit: true,
        application: true,
        invoice: {
          include: {
            payment: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add financial summary
    const leasesWithFinancials = leases.map((lease) => {
      const totalInvoiced =
        lease.invoice?.reduce((sum, inv) => sum + inv.amount, 0) ?? 0;

      const totalPaid =
        lease.invoice?.reduce(
          (sum, inv) =>
            sum +
            inv.payment.reduce((paySum, pay) => paySum + pay.amount, 0),
          0
        ) ?? 0;

      const balance = totalInvoiced - totalPaid;
        const buildingName =
        lease.property?.apartmentComplexDetail?.buildingName ??
        lease.property?.name ??
        "N/A";

        const houseName =
        lease.property?.houseDetail?.houseName ??
        lease.property?.name ??
        "N/A";
      return {
        ...lease,
        buildingName,
        houseName,
        financialSummary: { totalInvoiced, totalPaid, balance },
      };
    });

    return NextResponse.json(leasesWithFinancials);
  } catch (error) {
    console.error("Error fetching leases:", error);
    return NextResponse.json(
      { error: "Failed to fetch leases" },
      { status: 500 }
    );
  }
}
