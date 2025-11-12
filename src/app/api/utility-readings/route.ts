// app/api/utility-readings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/utility-readings -> List all readings
export async function GET() {
  try {
    const readings = await prisma.utility_reading.findMany({
      include: {
        lease_utility: {
          include: {
            Lease: true,  // From your lease_utility model
            utility: true
          }
        }
      },
      orderBy: { readingDate: "desc" },
    });

    return NextResponse.json({ success: true, data: readings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch utility readings" }, { status: 500 });
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
