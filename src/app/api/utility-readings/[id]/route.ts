import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reading = await prisma.utilityReading.findUnique({
      where: { id: params.id },
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
    });

    if (!reading) {
      return NextResponse.json(
        { success: false, error: "Reading not found" },
        { status: 404 }
      );
    }

    const formatted = {
      id: reading.id,
      readingValue: reading.readingValue,
      amount: reading.amount,
      readingDate: reading.readingDate,
      leaseUtility: {
        id: reading.leaseUtility.id,
        utility: reading.leaseUtility.utility,
        lease: {
          id: reading.leaseUtility.lease?.id,
          tenantName: reading.leaseUtility.lease?.tenant
            ? `${reading.leaseUtility.lease.tenant.firstName ?? ""} ${reading.leaseUtility.lease.tenant.lastName ?? ""}`.trim() || "Unknown Tenant"
            : "Unknown Tenant",
          unitNumber: reading.leaseUtility.lease?.unit?.unitNumber || "N/A",
          propertyName: reading.leaseUtility.lease?.property?.name || "N/A",
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { readingValue, readingDate, amount } = body;

    const updated = await prisma.utilityReading.update({
      where: { id: params.id },
      data: {
        readingValue,
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
  { params }: { params: { id: string } }
) {
  try {
    await prisma.utilityReading.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Reading deleted" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
