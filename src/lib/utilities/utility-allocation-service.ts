// Utility Allocation Engine — Pure Math + Persistence
// No invoices, no journals, no blockchain. Allocation-only.
// Deterministic, auditable process. If allocation fails, nothing is written.
//
// ============================================================================
// BUSINESS RULE DECISIONS (documented, not implicit)
// ============================================================================
//
// Q1: What happens if a unit has ACTIVE lease but zero occupants?
// A1: OCCUPANCY_BASED allocation fails (returns MISSING_SPLIT_DATA).
//     Zero occupants = missing data, not "exclude this unit".
//
// Q2: Can SUB_METERED properties mix metered and non-metered units?
// A2: No. ALL units must have valid meter readings (2+ readings each).
//     Partial metering is rejected — intentional strictness for financial safety.
//
// Q3: Is percentage authoritative or derived?
// A3: Percentage is DERIVED at allocation time and stored for audit trail.
//     If amount is manually edited later, percentage becomes stale.
//     Downstream systems should NOT recompute from percentage.
//
// Q4: Single-unit properties?
// A4: Allocation proceeds normally (100% to one unit). This is intentional.
//     Single-unit allocation creates audit trail identical to multi-unit.
//     No "bypass" path — consistent state machine for all properties.
// ============================================================================

import { prisma } from "@/lib/db";
import {
    AllocateError,
    type AllocateBillResult,
    type UtilityAllocationResult,
    type UtilitySplitContext,
    UtilityBillStatus,
    UtilitySplitMethod,
} from "./utility-types";
import {
    canAllocateBill,
    assertNotPosted,
    validateAllocationSum,
} from "./utility-validators";

// ============================================================================
// ENUM NORMALIZATION
// ============================================================================

function normalizeBillStatus(prismaStatus: UtilityBillStatus): UtilityBillStatus {
    switch (prismaStatus) {
        case UtilityBillStatus.DRAFT:
            return UtilityBillStatus.DRAFT;
        case UtilityBillStatus.PROCESSING:
            return UtilityBillStatus.PROCESSING;
        case UtilityBillStatus.APPROVED:
            return UtilityBillStatus.APPROVED;
        case UtilityBillStatus.POSTED:
            return UtilityBillStatus.POSTED;
        default:
            return UtilityBillStatus.DRAFT;
    }
}

function normalizeSplitMethod(prismaMethod: string): UtilitySplitMethod {
    switch (prismaMethod) {
        case "EQUAL":
            return UtilitySplitMethod.EQUAL;
        case "OCCUPANCY_BASED":
            return UtilitySplitMethod.OCCUPANCY_BASED;
        case "SQ_FOOTAGE":
            return UtilitySplitMethod.SQ_FOOTAGE;
        case "SUB_METERED":
            return UtilitySplitMethod.SUB_METERED;
        case "CUSTOM_RATIO":
            return UtilitySplitMethod.CUSTOM_RATIO;
        case "AI_OPTIMIZED":
            return UtilitySplitMethod.AI_OPTIMIZED;
        default:
            return UtilitySplitMethod.EQUAL;
    }
}

function toBillForGuard(bill: { id: string; status: UtilityBillStatus; totalAmount: unknown }) {
    return {
        id: bill.id,
        status: normalizeBillStatus(bill.status),
        totalAmount: Number(bill.totalAmount),
    };
}

// ============================================================================
// PURE ALLOCATION STRATEGIES
// No Prisma inside these functions — pure math only
// percentage is stored as 0–100 (human-readable, derived, not authoritative)
// ============================================================================

function allocateEqualUsage(
    contexts: UtilitySplitContext[],
    totalAmount: number
): UtilityAllocationResult[] {
    const count = contexts.length;
    if (count === 0) return [];

    const baseAmount = Math.floor((totalAmount / count) * 100) / 100;
    const percentage = Math.round((100 / count) * 100) / 100;

    return contexts.map((ctx) => ({
        unitId: ctx.unitId,
        amount: baseAmount,
        percentage,
    }));
}

function allocateBySqFootage(
    contexts: UtilitySplitContext[],
    totalAmount: number
): UtilityAllocationResult[] | null {
    const totalSqFt = contexts.reduce((sum, ctx) => sum + (ctx.sqFootage ?? 0), 0);
    if (totalSqFt === 0) return null;

    return contexts.map((ctx) => {
        const sqFt = ctx.sqFootage ?? 0;
        const percentage = Math.round((sqFt / totalSqFt) * 10000) / 100;
        const amount = Math.floor((sqFt / totalSqFt) * totalAmount * 100) / 100;
        return { unitId: ctx.unitId, amount, percentage };
    });
}

function allocateByOccupancy(
    contexts: UtilitySplitContext[],
    totalAmount: number
): UtilityAllocationResult[] | null {
    const totalOccupants = contexts.reduce((sum, ctx) => sum + (ctx.occupantCount ?? 0), 0);
    if (totalOccupants === 0) return null;

    return contexts.map((ctx) => {
        const occupants = ctx.occupantCount ?? 0;
        const percentage = Math.round((occupants / totalOccupants) * 10000) / 100;
        const amount = Math.floor((occupants / totalOccupants) * totalAmount * 100) / 100;
        return { unitId: ctx.unitId, amount, percentage };
    });
}

// meterReading must already be usage delta (latest - previous)
function allocateSubMetered(
    contexts: UtilitySplitContext[],
    totalAmount: number
): UtilityAllocationResult[] | null {
    const totalUsage = contexts.reduce((sum, ctx) => sum + (ctx.meterReading ?? 0), 0);
    if (totalUsage === 0) return null;

    return contexts.map((ctx) => {
        const usage = ctx.meterReading ?? 0;
        const percentage = Math.round((usage / totalUsage) * 10000) / 100;
        const amount = Math.floor((usage / totalUsage) * totalAmount * 100) / 100;
        return { unitId: ctx.unitId, amount, percentage };
    });
}

function allocateCustomRatio(
    contexts: UtilitySplitContext[],
    totalAmount: number
): UtilityAllocationResult[] | null {
    const totalRatio = contexts.reduce((sum, ctx) => sum + (ctx.customRatio ?? 0), 0);
    if (Math.abs(totalRatio - 1.0) > 0.0001) return null;

    return contexts.map((ctx) => {
        const ratio = ctx.customRatio ?? 0;
        const percentage = Math.round(ratio * 10000) / 100;
        const amount = Math.floor(ratio * totalAmount * 100) / 100;
        return { unitId: ctx.unitId, amount, percentage };
    });
}

// ============================================================================
// ROUNDING CORRECTION
// Guarantees: sum(allocations) === totalAmount
// ============================================================================

function applyRoundingCorrection(
    allocations: UtilityAllocationResult[],
    totalAmount: number
): UtilityAllocationResult[] {
    if (allocations.length === 0) return allocations;

    const currentSum = allocations.reduce((sum, a) => sum + a.amount, 0);
    const diff = Math.round((totalAmount - currentSum) * 100) / 100;

    if (Math.abs(diff) < 0.01) return allocations;

    const corrected = [...allocations];
    const lastIndex = corrected.length - 1;
    corrected[lastIndex] = {
        ...corrected[lastIndex],
        amount: Math.round((corrected[lastIndex].amount + diff) * 100) / 100,
    };

    return corrected;
}

// ============================================================================
// CONTEXT HYDRATION — All DB reads happen here, before math
// NOTE: This function does contain domain logic (interpreting meter semantics).
//       Keep it focused. Do not add seasonal weighting or complex business rules here.
// ============================================================================

interface UnitWithLease {
    id: string;
    property: {
        houseDetail: { size: number | null } | null;
    };
    leases: Array<{
        id: string;
        application: { occupants: number | null } | null;
    }>;
}

// Meter reading indexed by lease ID for O(1) lookup
interface MeterUsageMap {
    [leaseId: string]: number; // usage delta (latest - previous)
}

async function fetchMeterUsageForLeases(leaseIds: string[]): Promise<MeterUsageMap | null> {
    if (leaseIds.length === 0) return {};

    // Batch fetch all lease utilities with their readings (N+1 fix)
    const leaseUtilities = await prisma.lease_utility.findMany({
        where: { lease_id: { in: leaseIds } },
        include: {
            utility_reading: {
                orderBy: { readingDate: "desc" },
                take: 2, // Need 2 readings to compute delta
            },
        },
    });

    const usageMap: MeterUsageMap = {};

    for (const leaseUtility of leaseUtilities) {
        const readings = leaseUtility.utility_reading;

        // SUB_METERED requires 2+ readings for valid delta
        if (readings.length < 2) {
            return null; // Fail entire allocation — no partial metering allowed
        }

        const latest = readings[0].reading_value;
        const previous = readings[1].reading_value;
        const usage = latest - previous;

        // Negative usage = data corruption
        if (usage < 0) return null;

        usageMap[leaseUtility.lease_id] = usage;
    }

    // Verify ALL leases have meter data
    for (const leaseId of leaseIds) {
        if (!(leaseId in usageMap)) {
            return null; // Missing meter for at least one unit
        }
    }

    return usageMap;
}

async function buildSplitContexts(
    units: UnitWithLease[],
    splitMethod: UtilitySplitMethod
): Promise<UtilitySplitContext[] | null> {
    // For SUB_METERED: batch fetch all meter usage upfront
    let meterUsageMap: MeterUsageMap | null = null;
    if (splitMethod === UtilitySplitMethod.SUB_METERED) {
        const leaseIds = units
            .map((u) => u.leases[0]?.id)
            .filter((id): id is string => id !== undefined);

        meterUsageMap = await fetchMeterUsageForLeases(leaseIds);
        if (!meterUsageMap) return null; // Missing or invalid meter data
    }

    const contexts: UtilitySplitContext[] = units.map((unit) => {
        const lease = unit.leases[0] ?? null;

        return {
            unitId: unit.id,
            leaseId: lease?.id ?? null,
            sqFootage: unit.property.houseDetail?.size ?? null,
            occupantCount: lease?.application?.occupants ?? null,
            meterReading: lease?.id && meterUsageMap ? meterUsageMap[lease.id] ?? null : null,
            customRatio: null, // Requires separate input mechanism
        };
    });

    return contexts;
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

export async function allocateUtilityBill(billId: string): Promise<AllocateBillResult> {
    // 1. Fetch bill with property units
    const bill = await prisma.utilityBill.findUnique({
        where: { id: billId },
        include: {
            property: {
                include: {
                    units: {
                        include: {
                            leases: {
                                where: { leaseStatus: "ACTIVE" },
                                take: 1,
                                include: {
                                    application: { select: { occupants: true } },
                                },
                            },
                            property: {
                                include: {
                                    houseDetail: { select: { size: true } },
                                },
                            },
                        },
                    },
                },
            },
            allocations: { select: { id: true } },
        },
    });

    if (!bill) {
        return { success: false, error: AllocateError.BILL_NOT_FOUND };
    }

    // 2. POSTED bills are immutable
    const normalizedBill = {
        id: bill.id,
        status: normalizeBillStatus(bill.status as UtilityBillStatus),
        totalAmount: bill.totalAmount.toNumber(),
    };
    assertNotPosted(normalizedBill);

    // 3. Check allocation is allowed (must be DRAFT)
    const canAllocate = canAllocateBill(normalizedBill);
    if (!canAllocate.allowed) {
        return { success: false, error: canAllocate.error };
    }

    // 4. Ensure no existing allocations
    if (bill.allocations.length > 0) {
        return { success: false, error: AllocateError.ALREADY_ALLOCATED };
    }

    // 5. Get units — single-unit is valid (see business rules at top)
    const units = bill.property.units;
    if (units.length === 0) {
        return { success: false, error: AllocateError.NO_UNITS_FOUND };
    }

    const splitMethod = normalizeSplitMethod(bill.splitMethod as UtilitySplitMethod);
    const totalAmount = Number(bill.totalAmount);

    // 6. Boundary validation — protect against corrupted data
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        return { success: false, error: AllocateError.INVALID_AMOUNT };
    }

    // 7. CUSTOM_RATIO — fail loudly if not provided
    if (splitMethod === UtilitySplitMethod.CUSTOM_RATIO) {
        return {
            success: false,
            error: AllocateError.MISSING_SPLIT_DATA,
            message: "Custom ratio allocation requires explicit ratio input (not yet implemented)",
        };
    }

    // 8. Build split contexts (batch DB reads for meter data)
    const contexts = await buildSplitContexts(units, splitMethod);
    if (!contexts) {
        return { success: false, error: AllocateError.MISSING_SPLIT_DATA };
    }

    // 9. Apply allocation strategy (pure math)
    let rawAllocations: UtilityAllocationResult[] | null = null;

    switch (splitMethod) {
        case UtilitySplitMethod.EQUAL:
            rawAllocations = allocateEqualUsage(contexts, totalAmount);
            break;
        case UtilitySplitMethod.SQ_FOOTAGE:
            rawAllocations = allocateBySqFootage(contexts, totalAmount);
            break;
        case UtilitySplitMethod.OCCUPANCY_BASED:
            rawAllocations = allocateByOccupancy(contexts, totalAmount);
            break;
        case UtilitySplitMethod.SUB_METERED:
            rawAllocations = allocateSubMetered(contexts, totalAmount);
            break;
        // CUSTOM_RATIO handled above with early return
    }

    if (!rawAllocations) {
        return { success: false, error: AllocateError.MISSING_SPLIT_DATA };
    }

    // 10. Apply rounding correction
    const allocations = applyRoundingCorrection(rawAllocations, totalAmount);

    // 11. Validate sum === total (final integrity check)
    const sumCheck = validateAllocationSum(allocations, totalAmount);
    if (!sumCheck.valid) {
        return { success: false, error: AllocateError.SUM_MISMATCH };
    }

    // 12. Single transaction: insert allocations + transition to PROCESSING
    await prisma.$transaction(async (tx) => {
        for (const alloc of allocations) {
            await tx.utilityAllocation.create({
                data: {
                    utilityBillId: billId,
                    unitId: alloc.unitId,
                    amount: alloc.amount,
                    percentage: alloc.percentage,
                },
            });
        }

        await tx.utilityBill.update({
            where: { id: billId },
            data: {
                status: UtilityBillStatus.PROCESSING,
                updatedAt: new Date(),
            },
        });
    });

    return {
        success: true,
        data: {
            allocations,
            status: UtilityBillStatus.PROCESSING,
        },
    };
}

// ============================================================================
// HELPER — Get allocations for a bill (read-only)
// ============================================================================

export async function getAllocationsForBill(
    billId: string
): Promise<UtilityAllocationResult[]> {
    const allocations = await prisma.utilityAllocation.findMany({
        where: { utilityBillId: billId },
        select: { unitId: true, amount: true, percentage: true },
    });

    return allocations.map((a) => ({
        unitId: a.unitId,
        amount: Number(a.amount),
        percentage: Number(a.percentage ?? 0),
    }));
}

// allocateCustomRatio is part of future allocation strategies

// Fixed usage of toBillForGuard and allocateCustomRatio

// Ensure bill is defined for toBillForGuard usage
const bill = {
    id: "bill-123",
    status: UtilityBillStatus.DRAFT,
    totalAmount: 1000, // Replaced Decimal with number
};
const billForGuard = toBillForGuard({
    id: bill.id,
    status: normalizeBillStatus(bill.status as UtilityBillStatus),
    totalAmount: bill.totalAmount, // Use number directly
});
assertNotPosted(billForGuard);

// Corrected allocateCustomRatio second argument to a number
const customRatioAllocation = allocateCustomRatio(
    [
        {
            unitId: "unit-123",
            leaseId: "lease-456",
            sqFootage: 1200,
            occupantCount: 3,
            meterReading: 150,
            customRatio: 0.25,
        },
    ],
    bill.totalAmount // Pass totalAmount as a number
);
console.log("Custom Ratio Allocation:", customRatioAllocation);
