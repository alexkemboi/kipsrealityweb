import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/utilities/allocations
 * Fetches all utility allocations with related bill, unit, property, and utility data
 */
export async function GET(request: NextRequest) {
    try {
        const allocations = await prisma.utilityAllocation.findMany({
            select: {
                id: true,
                amount: true,
                percentage: true,
                utilityBill: {
                    select: {
                        id: true,
                        propertyId: true,
                        utilityId: true,
                        providerName: true,
                        periodStart: true,
                        periodEnd: true,
                        billDate: true,
                        splitMethod: true,
                        property: {
                            select: {
                                name: true,
                                address: true,
                            },
                        },
                    },
                },
                unit: {
                    select: {
                        unitNumber: true,
                        leases: {
                            where: { leaseStatus: "ACTIVE" },
                            select: {
                                tenant: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                            take: 1,
                        },
                    },
                },
            },
            orderBy: [
                { utilityBill: { billDate: "desc" } },
                { unit: { unitNumber: "asc" } },
            ],
        });

        // Get utility names separately
        const utilities = await prisma.utility.findMany();
        const utilityMap = new Map(utilities.map(u => [u.id, u.name]));

        // Transform to frontend-friendly shape
        const rows = allocations.map((alloc) => {
            const bill = alloc.utilityBill;
            const unit = alloc.unit;
            const lease = unit.leases[0];
            const tenant = lease?.tenant;

            // Format period string
            const periodStart = bill.periodStart
                ? new Date(bill.periodStart).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                })
                : "";
            const periodEnd = bill.periodEnd
                ? new Date(bill.periodEnd).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                })
                : "";
            const period = periodStart && periodEnd ? `${periodStart} – ${periodEnd}` : "";

            return {
                id: alloc.id,
                unit: unit.unitNumber,
                tenant: tenant ? `${tenant.firstName || ""} ${tenant.lastName || ""}`.trim() || "N/A" : "Vacant",
                utility: bill.utilityId ? utilityMap.get(bill.utilityId) || "Unknown" : "Unknown",
                provider: bill.providerName,
                period,
                periodRaw: bill.periodEnd?.toISOString() || bill.billDate.toISOString(),
                amount: Number(alloc.amount),
                basis: getBasisDescription(bill.splitMethod, alloc.percentage),
                property: bill.property.name || bill.property.address,
                propertyId: bill.propertyId,
            };
        });

        return NextResponse.json({ allocations: rows });
    } catch (error) {
        console.error("Error fetching allocations:", error);
        return NextResponse.json(
            { error: "Failed to fetch allocations" },
            { status: 500 }
        );
    }
}

/**
 * Generates a human-readable basis description based on split method
 */
function getBasisDescription(splitMethod: string, percentage: unknown): string {
    const pct = percentage ? `${Number(percentage).toFixed(1)}%` : "";

    switch (splitMethod) {
        case "EQUAL":
            return `Equal split${pct ? ` (${pct})` : ""}`;
        case "SUB_METERED":
            return "Sub-metered usage";
        case "SQ_FOOTAGE":
            return `Square footage${pct ? ` (${pct})` : ""}`;
        case "OCCUPANCY_BASED":
            return `Occupancy based${pct ? ` (${pct})` : ""}`;
        case "CUSTOM_RATIO":
            return `Custom ratio${pct ? ` (${pct})` : ""}`;
        case "AI_OPTIMIZED":
            return `AI optimized${pct ? ` (${pct})` : ""}`;
        default:
            return pct || "Allocated";
    }
}
