// app/api/utility-readings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
    const { lease_utility_id, reading_value, readingDate, amount } = body;

    if (!lease_utility_id || reading_value === undefined) {
      return NextResponse.json({ success: false, error: "lease_utility_id and reading_value are required" }, { status: 400 });
    }

    const newReading = await prisma.utility_reading.create({
      data: {
        lease_utility_id,
        reading_value,
        readingDate: readingDate ? new Date(readingDate) : undefined,
        amount
      },
    });

    return NextResponse.json({ success: true, data: newReading });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
