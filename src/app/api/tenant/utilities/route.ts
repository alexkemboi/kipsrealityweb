import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/tenant/utilities
 * Fetches utility bills/allocations for tenants
 * Note: In production, filter by authenticated tenant's leases
 */
export async function GET(request: NextRequest) {
    try {
        // Fetch all allocations (in production, filter by tenant's leases)
        const allocations = await prisma.utilityAllocation.findMany({
            select: {
                id: true,
                amount: true,
                percentage: true,
                utilityBill: {
                    select: {
                        id: true,
                        utilityId: true,
                        providerName: true,
                        status: true,
                        billDate: true,
                        dueDate: true,
                        periodStart: true,
                        periodEnd: true,
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
            orderBy: { utilityBill: { billDate: "desc" } },
        });

        // Get utility names separately
        const utilities = await prisma.utility.findMany();
        const utilityMap = new Map(utilities.map(u => [u.id, u.name]));

        // Transform to tenant-facing bill format
        const bills = allocations.map((alloc) => {
            const bill = alloc.utilityBill;
            const unit = alloc.unit;
            const lease = unit.leases[0];
            const tenant = lease?.tenant;

            const amount = Number(alloc.amount);
            const percentage = alloc.percentage ? Number(alloc.percentage) : null;

            return {
                id: alloc.id,
                billId: bill.id,
                utilityType: bill.utilityId ? utilityMap.get(bill.utilityId) || "Unknown" : "Unknown",
                providerName: bill.providerName,
                propertyName: bill.property.name || bill.property.address,
                unitNumber: unit.unitNumber,
                tenantName: tenant ? `${tenant.firstName || ""} ${tenant.lastName || ""}`.trim() : "N/A",
                amountDue: amount,
                status: bill.status === "POSTED" ? "PAID" : bill.status === "APPROVED" ? "PENDING" : "DRAFT",
                dueDate: bill.dueDate.toISOString(),
                billDate: bill.billDate.toISOString(),
                periodStart: bill.periodStart?.toISOString() || null,
                periodEnd: bill.periodEnd?.toISOString() || null,
                isAllocated: true,
                percentage: percentage,
            };
        });

        return NextResponse.json({ bills });
    } catch (error) {
        console.error("Error fetching tenant utilities:", error);
        return NextResponse.json(
            { error: "Failed to fetch utility bills" },
            { status: 500 }
        );
    }
}
