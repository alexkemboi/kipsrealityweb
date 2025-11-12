// app/api/lease-utilities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/lease-utilities -> List all lease utilities with relations
export async function GET() {
  try {
    const leaseUtilities = await prisma.lease_utility.findMany({
      include: {
        utility: true, // Include utility details
        Lease: {
          include: {
            tenant: true,
            unit: true,
            property: true,
            application: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: leaseUtilities });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lease utilities" },
      { status: 500 }
    );
  }
}

// POST /api/lease-utilities -> Assign utility to a lease
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lease_id, utility_id, is_tenant_responsible = true } = body;

    if (!lease_id || !utility_id) {
      return NextResponse.json(
        { success: false, error: "lease_id and utility_id are required" },
        { status: 400 }
      );
    }

    // Check if the assignment already exists
    const existing = await prisma.lease_utility.findFirst({
      where: { lease_id, utility_id },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Utility already assigned to this lease" },
        { status: 400 }
      );
    }

    const assignment = await prisma.lease_utility.create({
      data: { lease_id, utility_id, is_tenant_responsible },
      include: {
        Lease: {
          include: {
            tenant: true,
            unit: true,
            property: true,
            application: true,
          },
        },
        utility: true,
      },
    });

    return NextResponse.json({ success: true, data: assignment });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
