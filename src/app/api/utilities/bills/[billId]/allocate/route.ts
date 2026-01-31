// POST /api/utilities/bills/[billId]/allocate - Allocate a utility bill

import { NextRequest, NextResponse } from "next/server";
import { allocateUtilityBill } from "@/lib/utilities/utility-allocation-service";

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ billId: string }> }
) {
    try {
        const { billId } = await params;

        // Use the backend allocation service
        const result = await allocateUtilityBill(billId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, message: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                allocations: result.data.allocations,
                status: result.data.status,
            },
        });
    } catch (error) {
        console.error("Allocate bill error:", error);
        return NextResponse.json(
            { success: false, error: "ALLOCATION_FAILED", message: "Failed to allocate bill" },
            { status: 500 }
        );
    }
}
