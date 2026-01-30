import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/utility-readings
export async function GET() {
  try {
    const readings = await prisma.utility_reading.findMany({
      include: {
        lease_utility: {
          include: {
            utility: true,
            Lease: {
              include: {
                tenant: true,
                unit: true,
                property: true,
              },
            },
          },
        },
      },
      orderBy: { readingDate: "desc" },
    });

    const formatted = readings.map((r: any) => ({
      id: r.id,
      readingValue: r.reading_value,
      amount: r.amount,
      readingDate: r.readingDate,
      leaseUtility: {
        id: r.lease_utility_id,
        leaseUtility: r.lease_utility,
        lease: {
          id: r.lease_utility.Lease?.id,
          tenantName: r.lease_utility.Lease?.tenant
            ? `${r.lease_utility.Lease.tenant.firstName ?? ""} ${r.lease_utility.Lease.tenant.lastName ?? ""}`.trim() || "Unknown Tenant"
            : "Unknown Tenant",
          unitNumber: r.lease_utility.Lease?.unit?.unitNumber || "N/A",
          propertyName: r.lease_utility.Lease?.property?.name || "N/A",
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

    const previous = await prisma.utility_reading.findFirst({
      where: { lease_utility_id: leaseUtilityId },
      orderBy: { readingDate: "desc" }
    });

    const leaseUtility = await prisma.lease_utility.findUnique({
      where: { id: leaseUtilityId },
      include: { utility: true }
    });

    if (!leaseUtility) {
      return NextResponse.json(
        { success: false, error: "Lease utility not found" },
        { status: 404 }
      );
    }

    const prevVal = previous?.reading_value ?? 0;
    const consumption = readingValue - prevVal;

    if (consumption < 0) {
      return NextResponse.json(
        { success: false, error: "Reading must be greater than previous reading" },
        { status: 400 }
      );
    }

    const amount = consumption * (leaseUtility.utility.unitPrice ?? 0);

    const newReading = await prisma.utility_reading.create({
      data: {
        lease_utility_id: leaseUtilityId,
        reading_value: readingValue,
        readingDate: readingDate ? new Date(readingDate) : new Date(),
        amount,
      },
    });

    return NextResponse.json({ success: true, data: newReading });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
