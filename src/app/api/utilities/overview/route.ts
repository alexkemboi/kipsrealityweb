import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/utilities/overview
 * Fetches summary stats for the utilities dashboard
 */
export async function GET(request: NextRequest) {
    try {
        // Get all utility bills with explicit select
        const bills = await prisma.utilityBill.findMany({
            select: {
                id: true,
                propertyId: true,
                utilityId: true,
                providerName: true,
                totalAmount: true,
                status: true,
                billDate: true,
                dueDate: true,
                property: {
                    select: {
                        name: true,
                        address: true,
                    },
                },
                allocations: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: { billDate: "desc" },
        });

        // Get utility data separately
        const utilities = await prisma.utility.findMany();
        const utilityMap = new Map(utilities.map(u => [u.id, u.name]));

        // Get recent readings with explicit select
        const readings = await prisma.utility_reading.findMany({
            select: {
                id: true,
                reading_value: true,
                amount: true,
                readingDate: true,
                lease_utility: {
                    select: {
                        utility: {
                            select: {
                                name: true,
                            },
                        },
                        Lease: {
                            select: {
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
                            },
                        },
                    },
                },
            },
            orderBy: { readingDate: "desc" },
            take: 20,
        });

        // Calculate summary stats
        const totalBillAmount = bills.reduce(
            (sum, b) => sum + Number(b.totalAmount),
            0
        );
        const pendingBills = bills.filter((b) => b.status === "DRAFT" || b.status === "PROCESSING" || b.status === "REVIEW_REQUIRED");
        const approvedBills = bills.filter((b) => b.status === "APPROVED" || b.status === "POSTED");

        // Get unique properties and utilities
        const uniqueProperties = new Set(bills.map((b) => b.propertyId));
        const uniqueUtilities = new Set(bills.map((b) => b.utilityId).filter(Boolean));

        // Format recent bills for display
        const recentBills = bills.slice(0, 5).map((bill) => ({
            id: bill.id,
            propertyName: bill.property.name || bill.property.address,
            utilityType: bill.utilityId ? utilityMap.get(bill.utilityId) || "Unknown" : "Unknown",
            providerName: bill.providerName,
            totalAmount: Number(bill.totalAmount),
            status: bill.status,
            billDate: bill.billDate.toISOString(),
            dueDate: bill.dueDate.toISOString(),
        }));

        // Format recent readings for display
        const recentReadings = readings.map((reading: any) => ({
            id: reading.id,
            utilityName: reading.lease_utility.utility.name,
            unitNumber: reading.lease_utility.Lease.unit.unitNumber,
            propertyName: reading.lease_utility.Lease.property.name || reading.lease_utility.Lease.property.address,
            readingValue: reading.reading_value,
            amount: reading.amount,
            readingDate: reading.readingDate?.toISOString(),
        }));

        return NextResponse.json({
            summary: {
                totalBillAmount,
                billCount: bills.length,
                pendingBillCount: pendingBills.length,
                approvedBillCount: approvedBills.length,
                propertyCount: uniqueProperties.size,
                utilityCount: uniqueUtilities.size,
                readingCount: readings.length,
            },
            recentBills,
            recentReadings,
        });
    } catch (error) {
        console.error("Error fetching utilities overview:", error);
        return NextResponse.json(
            { error: "Failed to fetch utilities overview" },
            { status: 500 }
        );
    }
}
