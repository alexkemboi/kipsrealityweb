import { NextResponse } from 'next/server';
import { utilityService } from '@/lib/finance/utility-service';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: utilityBillId } = await params;
        const { allocations } = await request.json();

        if (!allocations || allocations.length === 0) {
            return NextResponse.json(
                { error: "Allocations required" },
                { status: 400 }
            );
        }

        const result = await utilityService.postAllocations(utilityBillId, allocations);

        return NextResponse.json({
            success: true,
            message: "Utility bill posted successfully",
            data: {
                utilityBillId: result.utilityBill.id,
                allocationsCreated: result.results.length,
                invoicesGenerated: result.results.length,
                masterJournalEntry: result.masterGLEntry.id,
                totalExpense: Number(result.utilityBill.totalAmount),
                totalRecovery: result.results.reduce(
                    (sum, r) => sum + Number(r.invoice.totalAmount),
                    0
                )
            }
        });

    } catch (error: any) {
        console.error('Utility posting error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
