import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";

/**
 * GET /api/properties/:propertyId/stats
 * 
 * Aggregates dashboard stats for a specific property.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    // Verify auth
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // const propertyId = params.propertyId; // already destructured above

    // Verify property exists and user has access
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, organizationId: true, name: true, city: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Verify organization access
    if (!property.organizationId) {
      return NextResponse.json(
        { error: "Property missing organization" },
        { status: 400 }
      );
    }

    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: property.organizationId,
        userId: decoded.userId,
      },
    });

    if (!orgUser) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Count available units (isOccupied = false)
    const unitsAvailable = await prisma.unit.count({
      where: {
        propertyId,
        isOccupied: false,
      },
    });

    // Count total units
    const totalUnits = await prisma.unit.count({
      where: { propertyId },
    });

    // Count active leases
    const activeLeases = await prisma.lease.count({
      where: {
        propertyId,
        leaseStatus: { in: ["ACTIVE", "SIGNED"] },
      },
    });

    // Count total tenants (distinct users on active leases)
    const tenants = await prisma.lease.findMany({
      where: {
        propertyId,
        leaseStatus: { in: ["ACTIVE", "SIGNED"] },
      },
      select: { tenantId: true },
      distinct: ["tenantId"],
    });

    const totalTenants = tenants.filter((t: any) => t.tenantId !== null).length;

    // Count overdue payments
    let overduePayments = 0;
    try {
      const leases = await prisma.lease.findMany({
        where: { propertyId },
        select: { id: true },
      });

      const leaseIds = leases.map((l: any) => l.id);

      if (leaseIds.length > 0) {
        overduePayments = await prisma.invoice.count({
          where: {
            status: "OVERDUE",
            leaseId: { in: leaseIds },
          },
        });
      }
    } catch (invoiceError) {
      console.error("[/api/properties/:propertyId/stats] Error counting invoices:", invoiceError);
      overduePayments = 0;
    }

    // Calculate occupancy rate
    const occupancyRate = totalUnits > 0 ? ((totalUnits - unitsAvailable) / totalUnits) * 100 : 0;

    return NextResponse.json({
      propertyId,
      propertyName: property.name,
      city: property.city,
      unitsAvailable,
      totalUnits,
      activeLeases,
      totalTenants,
      overduePayments,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
    });
  } catch (error) {
    console.error("[GET /api/properties/:propertyId/stats]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
