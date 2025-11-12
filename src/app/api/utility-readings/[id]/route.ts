// app/api/utility-readings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/utility-readings/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const reading = await prisma.utility_reading.findUnique({
      where: { id },
      include: {
        lease_utility: {
          include: {
            Lease: true,
            utility: true
          }
        }
      },
    });

    if (!reading) {
      return NextResponse.json({ success: false, error: "Utility reading not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: reading });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch utility reading" }, { status: 500 });
  }
}

// PUT /api/utility-readings/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { reading_value, readingDate, amount } = body;

    const updated = await prisma.utility_reading.update({
      where: { id },
      data: {
        reading_value,
        readingDate: readingDate ? new Date(readingDate) : undefined,
        amount
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/utility-readings/:id
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.utility_reading.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Utility reading deleted successfully" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
