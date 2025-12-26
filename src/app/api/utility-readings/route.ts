import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/utility-readings
export async function GET() {
  try {
    const readings = await prisma.utilityReading.findMany({
      include: {
        leaseUtility: {
          include: {
            utility: true,
            lease: {
              include: {
                tenant: true,
                unit: true,
                property: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = readings.map((r: any) => ({
      id: r.id,
      readingValue: r.readingValue,
      amount: r.amount,
      readingDate: r.readingDate,
      leaseUtility: {
        id: r.leaseUtility.id,
        utility: r.leaseUtility.utility,
        lease: {
          id: r.leaseUtility.lease?.id,
          tenantName: r.leaseUtility.lease?.tenant
            ? `${r.leaseUtility.lease.tenant.firstName ?? ""} ${r.leaseUtility.lease.tenant.lastName ?? ""}`.trim() || "Unknown Tenant"
            : "Unknown Tenant",
          unitNumber: r.leaseUtility.lease?.unit?.unitNumber || "N/A",
          propertyName: r.leaseUtility.lease?.property?.name || "N/A",
        },
      },
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch utility readings" },
      { status: 500 }
    );
  }
}

// POST /api/utility-readings -> Add new reading
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leaseUtilityId, readingValue, readingDate } = body;

    if (!leaseUtilityId || readingValue == null) {
      return NextResponse.json(
        { success: false, error: "leaseUtilityId and readingValue are required" },
        { status: 400 }
      );
    }

    const previous = await prisma.utilityReading.findFirst({
      where: { leaseUtilityId },
      orderBy: { readingDate: "desc" }
    });

    const leaseUtility = await prisma.leaseUtility.findUnique({
      where: { id: leaseUtilityId },
      include: { utility: true }
    });

    if (!leaseUtility) {
      return NextResponse.json(
        { success: false, error: "Lease utility not found" },
        { status: 404 }
      );
    }

    const prevVal = previous?.readingValue ?? 0;
    const consumption = readingValue - prevVal;

    if (consumption < 0) {
      return NextResponse.json(
        { success: false, error: "Reading must be greater than previous reading" },
        { status: 400 }
      );
    }

    const amount = consumption * (leaseUtility.utility.unitPrice ?? 0);

    const newReading = await prisma.utilityReading.create({
      data: {
        leaseUtilityId,
        readingValue,
        readingDate: readingDate ? new Date(readingDate) : new Date(),
        amount,
      },
    });

    return NextResponse.json({ success: true, data: newReading });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
