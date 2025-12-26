// app/api/lease-utilities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/lease-utilities -> List all lease utilities with relations
export async function GET() {
  try {
    const leaseUtilities = await prisma.leaseUtility.findMany({
      include: {
        utility: true, // Include utility details
        lease: {
          include: {
            tenant: true,
            unit: true,
            property: true,
            tenantApplication: true,
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
    const { leaseId, utilityId, isTenantResponsible = true } = body;

    if (!leaseId || !utilityId) {
      return NextResponse.json(
        { success: false, error: "leaseId and utilityId are required" },
        { status: 400 }
      );
    }

    // Check if the assignment already exists
    const existing = await prisma.leaseUtility.findFirst({
      where: { leaseId, utilityId },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Utility already assigned to this lease" },
        { status: 400 }
      );
    }

    const assignment = await prisma.leaseUtility.create({
      data: { leaseId, utilityId, isTenantResponsible },
      include: {
        lease: {
          include: {
            tenant: true,
            unit: true,
            property: true,
            tenantApplication: true,
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
