import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

      // Optional extended fields
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
    
    const finalTenantId = tenantId ?? null;

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
        tenantId,
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


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { error: "applicationId is required" },
        { status: 400 }
      );
    }

    const lease = await prisma.lease.findUnique({
      where: { applicationId },
      include: {
        tenant: true,
        property: true,
        unit: true,
        application: true,
      }
    });

    if (!lease) {
      return NextResponse.json(
        { error: "Lease not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(lease);

  } catch (error: any) {
    console.error("GET lease error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
