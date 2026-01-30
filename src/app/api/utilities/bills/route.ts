import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/utilities/bills
 * Fetches all utility bills
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get("propertyId");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (propertyId) where.propertyId = propertyId;

        const bills = await prisma.utilityBill.findMany({
            where,
            select: {
                id: true,
                propertyId: true,
                utilityId: true,
                providerName: true,
                totalAmount: true,
                consumption: true,
                rate: true,
                periodStart: true,
                periodEnd: true,
                billDate: true,
                dueDate: true,
                status: true,
                splitMethod: true,
                createdAt: true,
                property: {
                    select: {
                        name: true,
                        address: true,
                    },
                },
                allocations: {
                    select: {
                        id: true,
                        unit: {
                            select: {
                                unitNumber: true,
                            },
                        },
                    },
                },
            },
            orderBy: { billDate: "desc" },
        });

        // Get utility names separately
        const utilities = await prisma.utility.findMany();
        const utilityMap = new Map(utilities.map(u => [u.id, u.name]));

        const formattedBills = bills.map((bill) => ({
            id: bill.id,
            propertyId: bill.propertyId,
            propertyName: bill.property.name || bill.property.address,
            utilityId: bill.utilityId,
            utilityType: bill.utilityId ? utilityMap.get(bill.utilityId) || "Unknown" : "Unknown",
            providerName: bill.providerName,
            totalAmount: Number(bill.totalAmount),
            consumption: bill.consumption,
            rate: bill.rate,
            status: bill.status,
            splitMethod: bill.splitMethod,
            billDate: bill.billDate.toISOString(),
            dueDate: bill.dueDate.toISOString(),
            periodStart: bill.periodStart?.toISOString(),
            periodEnd: bill.periodEnd?.toISOString(),
            allocationCount: bill.allocations.length,
            createdAt: bill.createdAt.toISOString(),
        }));

        return NextResponse.json({ bills: formattedBills });
    } catch (error) {
        console.error("Error fetching bills:", error);
        return NextResponse.json(
            { error: "Failed to fetch bills" },
            { status: 500 }
        );
    }
}
