import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const reading = await prisma.utility_reading.findUnique({
      where: { id: id },
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
    });

    if (!reading) {
      return NextResponse.json(
        { success: false, error: "Reading not found" },
        { status: 404 }
      );
    }

    const formatted = {
      id: reading.id,
      readingValue: reading.reading_value,
      amount: reading.amount,
      readingDate: reading.readingDate,
      leaseUtility: {
        id: reading.lease_utility.id,
        utility: reading.lease_utility.utility,
        lease: {
          id: reading.lease_utility.Lease?.id,
          tenantName: reading.lease_utility.Lease?.tenant
            ? `${reading.lease_utility.Lease.tenant.firstName ?? ""} ${reading.lease_utility.Lease.tenant.lastName ?? ""}`.trim() || "Unknown Tenant"
            : "Unknown Tenant",
          unitNumber: reading.lease_utility.Lease?.unit?.unitNumber || "N/A",
          propertyName: reading.lease_utility.Lease?.property?.name || "N/A",
        },
      },
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch utility reading" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { readingValue, readingDate, amount } = body;

    const updated = await prisma.utility_reading.update({
      where: { id: id },
      data: {
        reading_value: readingValue,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.utility_reading.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: "Reading deleted" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
