import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/utilities/readings
 * Fetches utility readings with optional filtering
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get("propertyId");
        const utilityId = searchParams.get("utilityId");

        // Fetch readings with explicit select
        const readings = await prisma.utility_reading.findMany({
            select: {
                id: true,
                lease_utility_id: true,
                reading_value: true,
                amount: true,
                readingDate: true,
                createdAt: true,
                lease_utility: {
                    select: {
                        utility_id: true,
                        utility: {
                            select: {
                                name: true,
                            },
                        },
                        Lease: {
                            select: {
                                unitId: true,
                                propertyId: true,
                                unit: {
                                    select: {
                                        unitNumber: true,
                                    },
                                },
                                property: {
                                    select: {
                                        name: true,
                                        address: true,
                                    },
                                },
                                tenant: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { readingDate: "desc" },
        });

        // Filter by property/utility if provided
        const filtered = readings.filter((r: any) => {
            const matchProperty = !propertyId || r.lease_utility.Lease.propertyId === propertyId;
            const matchUtility = !utilityId || r.lease_utility.utility_id === utilityId;
            return matchProperty && matchUtility;
        });

        const formattedReadings = filtered.map((reading: any) => {
            const lease = reading.lease_utility.Lease;
            const tenant = lease.tenant;

            return {
                id: reading.id,
                leaseUtilityId: reading.lease_utility_id,
                utilityId: reading.lease_utility.utility_id,
                utilityName: reading.lease_utility.utility.name,
                unitId: lease.unitId,
                unitNumber: lease.unit.unitNumber,
                propertyId: lease.propertyId,
                propertyName: lease.property.name || lease.property.address,
                tenantName: tenant ? `${tenant.firstName || ""} ${tenant.lastName || ""}`.trim() : "N/A",
                readingValue: reading.reading_value,
                amount: reading.amount,
                readingDate: reading.readingDate?.toISOString(),
                createdAt: reading.createdAt?.toISOString(),
            };
        });

        return NextResponse.json({ readings: formattedReadings });
    } catch (error) {
        console.error("Error fetching readings:", error);
        return NextResponse.json(
            { error: "Failed to fetch readings" },
            { status: 500 }
        );
    }
}
