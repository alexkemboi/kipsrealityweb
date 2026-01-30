// GET /api/utilities/bills/[billId]/allocations - Get allocations for a bill

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UtilityAllocation, Unit } from "@prisma/client";

type AllocationWithRelations = UtilityAllocation & {
    unit: Pick<Unit, 'id' | 'unitNumber'> | null;
};

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ billId: string }> }
) {
    try {
        const { billId } = await params;

        const bill = await prisma.utilityBill.findUnique({
            where: { id: billId },
            include: {
                property: { select: { id: true, name: true } },
                allocations: {
                    include: {
                        unit: { select: { id: true, unitNumber: true } },
                    }
                }
            }
        });

        if (!bill) {
            return NextResponse.json(
                { success: false, error: "Bill not found" },
                { status: 404 }
            );
        }

        const formattedAllocations = bill.allocations.map((a: AllocationWithRelations) => ({
            id: a.id,
            unitId: a.unitId,
            unitNumber: a.unit?.unitNumber || "Unknown",
            amount: Number(a.amount),
            percentage: Number(a.percentage ?? 0)
        }));

        return NextResponse.json({
            success: true,
            data: {
                billId: bill.id,
                providerName: bill.providerName,
                totalAmount: Number(bill.totalAmount),
                billDate: bill.billDate,
                status: bill.status,
                splitMethod: bill.splitMethod,
                property: bill.property,
                allocations: formattedAllocations
            }
        });

    } catch (error) {
        console.error("GET allocations error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch allocations" },
            { status: 500 }
        );
    }
}
