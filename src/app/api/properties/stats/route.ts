import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";

/**
 * GET /api/properties/stats
 * 
 * Aggregates dashboard stats for all properties in the organization.
 * Query params:
 *   - organizationId (required): The organization to aggregate stats for
 */
export async function GET(request: NextRequest) {
  try {
    // Verify auth
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      console.error("[/api/properties/stats] No token provided");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      console.error("[/api/properties/stats] Invalid token");
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }


    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const propertyId = searchParams.get("propertyId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Verify organization access
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId,
        userId: decoded.userId,
      },
    });

    if (!orgUser) {
      console.error(`[/api/properties/stats] User ${decoded.userId} not in org ${organizationId}`);
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Get property IDs to aggregate
    let propertyIds: string[] = [];
    if (propertyId) {
      // Only aggregate for the given propertyId
      propertyIds = [propertyId];
    } else {
      // All properties in the org
      const properties = await prisma.property.findMany({
        where: { organizationId },
        select: { id: true },
      });
      propertyIds = properties.map((p: any) => p.id);
      console.log(`[/api/properties/stats] Found ${propertyIds.length} properties for org ${organizationId}`);
    }

    if (propertyIds.length === 0) {
      return NextResponse.json({
        unitsAvailable: 0,
        activeLeases: 0,
        totalTenants: 0,
        overduePayments: 0,
      });
    }

    // Count available units (isOccupied = false)
    const availableUnits = await prisma.unit.count({
      where: {
        propertyId: { in: propertyIds },
        isOccupied: false,
      },
    });

    // Count active leases - check both ACTIVE and SIGNED statuses
    const activeLeases = await prisma.lease.count({
      where: {
        propertyId: { in: propertyIds },
        leaseStatus: { in: ["ACTIVE", "SIGNED"] },
      },
    });

    // Count total tenants (distinct users on active leases)
    const tenants = await prisma.lease.findMany({
      where: {
        propertyId: { in: propertyIds },
        leaseStatus: { in: ["ACTIVE", "SIGNED"] },
      },
      select: { tenantId: true },
      distinct: ["tenantId"],
    });

    const totalTenants = tenants.filter((t: any) => t.tenantId !== null).length;


    // Count overdue payments and sum total rent collected
    let overduePayments = 0;
    let totalRentCollected = 0;
    try {
      // Get all lease IDs for this org
      const leases = await prisma.lease.findMany({
        where: {
          propertyId: { in: propertyIds },
        },
        select: { id: true },
      });

      const leaseIds = leases.map((l: any) => l.id);

      if (leaseIds.length > 0) {
        overduePayments = await prisma.invoice.count({
          where: {
            status: "OVERDUE",
            lease_id: { in: leaseIds },
          },
        });

        // Get all invoice IDs for these leases
        const invoices = await prisma.invoice.findMany({
          where: { lease_id: { in: leaseIds } },
          select: { id: true }
        });
        const invoiceIds = invoices.map((inv: any) => inv.id);

        if (invoiceIds.length > 0) {
          // Sum all successful payments for these invoices
          const payments = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { invoice_id: { in: invoiceIds } }
          });
          totalRentCollected = payments._sum.amount || 0;
        }
      }
    } catch (invoiceError) {
      console.error("[/api/properties/stats] Error counting invoices or summing payments:", invoiceError);
      overduePayments = 0;
      totalRentCollected = 0;
    }

    console.log(`[/api/properties/stats] Stats: units=${availableUnits}, leases=${activeLeases}, tenants=${totalTenants}, overdue=${overduePayments}`);

    return NextResponse.json({
      unitsAvailable: availableUnits,
      activeLeases,
      totalTenants,
      overduePayments,
      totalRentCollected,
    });
  } catch (error) {
    console.error("[GET /api/properties/stats]", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
