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
      orderBy: { createdAt: "desc" },
    });

    const formatted = readings.map((r) => ({
      id: r.id,
      reading_value: r.reading_value,
      amount: r.amount,
      readingDate: r.readingDate,
      lease_utility: {
        id: r.lease_utility.id,
        utility: r.lease_utility.utility,
        Lease: {
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
    const { lease_utility_id, reading_value, readingDate } = body;

    if (!lease_utility_id || reading_value == null) {
      return NextResponse.json(
        { success: false, error: "lease_utility_id and reading_value are required" },
        { status: 400 }
      );
    }

    const previous = await prisma.utility_reading.findFirst({
      where: { lease_utility_id },
      orderBy: { readingDate: "desc" }
    });

    const leaseUtility = await prisma.lease_utility.findUnique({
      where: { id: lease_utility_id },
      include: { utility: true }
    });

    if (!leaseUtility) {
      return NextResponse.json(
        { success: false, error: "Lease utility not found" },
        { status: 404 }
      );
    }

    const prevVal = previous?.reading_value ?? 0;
    const consumption = reading_value - prevVal;

    if (consumption < 0) {
      return NextResponse.json(
        { success: false, error: "Reading must be greater than previous reading" },
        { status: 400 }
      );
    }

    const amount = consumption * (leaseUtility.utility.unitPrice ?? 0);

    const newReading = await prisma.utility_reading.create({
      data: {
        lease_utility_id,
        reading_value,
        readingDate: readingDate ? new Date(readingDate) : new Date(),
        amount,
      },
    });

    return NextResponse.json({ success: true, data: newReading });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
