import { NextResponse } from 'next/server';
import { utilityService } from '@/lib/finance/utility-service';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: utilityBillId } = await params;
        const result = await utilityService.calculateAllocations(utilityBillId);

        return NextResponse.json({
            success: true,
            utilityBill: {
                id: result.utilityBill.id,
                providerName: result.utilityBill.providerName,
                totalAmount: result.totalAmount,
                splitMethod: result.utilityBill.splitMethod,
                periodStart: result.utilityBill.periodStart,
                periodEnd: result.utilityBill.periodEnd
            },
            allocations: result.allocations,
            summary: {
                totalAllocated: result.allocations.reduce((sum, a) => sum + Number(a.amount), 0),
                numberOfTenants: result.allocations.length,
                averagePerTenant: result.allocations.length > 0 ?
                    result.allocations.reduce((sum, a) => sum + Number(a.amount), 0) / result.allocations.length : 0
            }
        });

    } catch (error: any) {
        console.error('Utility calculation error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
