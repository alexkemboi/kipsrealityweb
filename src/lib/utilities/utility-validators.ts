// Utility Billing Module — Validation Guards
// Enforces lifecycle and financial invariants (no side effects)

import { z } from "zod";
import {
    UtilityBillStatus,
    UtilitySplitMethod,
    UtilityImportMethod,
    ReadingError,
    AllocateError,
    ApproveError,
    PostError,
    type CreateUtilityBillInput,
    type CreateUtilityReadingInput,
    type UtilityAllocationResult,
} from "./utility-types";

// ============================================================================
// ZOD INPUT SCHEMAS
// ============================================================================

// Validates bill creation input before persistence
export const CreateUtilityBillInputSchema = z.object({
    propertyId: z.string().min(1, "Property ID is required"),
    providerName: z.string().min(1, "Provider name is required"),
    totalAmount: z.number().positive("Bill amount must be positive"),
    billDate: z.date(),
    dueDate: z.date(),
    splitMethod: z.nativeEnum(UtilitySplitMethod),
    importMethod: z.nativeEnum(UtilityImportMethod).optional(),
    fileUrl: z.string().url().optional(),
    ocrConfidence: z.number().min(0).max(1).optional(),
}).refine(
    (data) => data.dueDate >= data.billDate,
    { message: "Due date must be on or after bill date", path: ["dueDate"] }
) satisfies z.ZodType<CreateUtilityBillInput>;

// Validates meter reading input before persistence
export const CreateUtilityReadingInputSchema = z.object({
    leaseUtilityId: z.string().min(1, "Lease utility ID is required"),
    readingValue: z.number().nonnegative("Reading value cannot be negative"),
    readingDate: z.date().optional(),
}) satisfies z.ZodType<CreateUtilityReadingInput>;

// ============================================================================
// STATE TRANSITION GUARDS
// ============================================================================

interface BillForGuard {
    id: string;
    status: string;
    totalAmount: number;
}

// Only DRAFT bills can be allocated
export function canAllocateBill(
    bill: BillForGuard
): { allowed: true } | { allowed: false; error: AllocateError } {
    if (bill.status !== UtilityBillStatus.DRAFT) {
        return { allowed: false, error: AllocateError.INVALID_STATUS };
    }
    return { allowed: true };
}

// PROCESSING + allocations must exist and sum correctly
export function canApproveBill(
    bill: BillForGuard,
    allocations: UtilityAllocationResult[]
): { allowed: true } | { allowed: false; error: ApproveError } {
    if (bill.status !== UtilityBillStatus.PROCESSING) {
        return { allowed: false, error: ApproveError.INVALID_STATUS };
    }

    if (!allocations || allocations.length === 0) {
        return { allowed: false, error: ApproveError.NO_ALLOCATIONS };
    }

    const sumCheck = validateAllocationSum(allocations, bill.totalAmount);
    if (!sumCheck.valid) {
        return { allowed: false, error: ApproveError.ALLOCATION_SUM_MISMATCH };
    }

    return { allowed: true };
}

// Only APPROVED bills can be posted — final irreversible step
export function canPostBill(
    bill: BillForGuard
): { allowed: true } | { allowed: false; error: PostError } {
    if (bill.status !== UtilityBillStatus.APPROVED) {
        return { allowed: false, error: PostError.NOT_APPROVED };
    }
    return { allowed: true };
}

// POSTED bills are immutable — accounting invariant
export function assertNotPosted(bill: BillForGuard): void {
    if (bill.status === UtilityBillStatus.POSTED) {
        throw new PostedBillError(bill.id);
    }
}

export class PostedBillError extends Error {
    readonly billId: string;
    readonly code = "BILL_ALREADY_POSTED" as const;

    constructor(billId: string) {
        super(`Cannot modify bill ${billId}: already posted to financials`);
        this.billId = billId;
        this.name = "PostedBillError";
    }
}

// ============================================================================
// ALLOCATION INTEGRITY CHECKS
// Prevents silent money loss or creation
// ============================================================================

// Floating-point tolerance — we care about cents, not fractions
const MONETARY_PRECISION = 0.01;

// Every cent must be accounted for
export function validateAllocationSum(
    allocations: UtilityAllocationResult[],
    billTotal: number
): { valid: true } | { valid: false; difference: number } {
    const sum = allocations.reduce((acc, a) => acc + a.amount, 0);
    const difference = Math.abs(sum - billTotal);

    if (difference > MONETARY_PRECISION) {
        return { valid: false, difference };
    }
    return { valid: true };
}

// Ratios must sum to 1.0 (with floating-point tolerance)
export function validatePercentageSum(
    percentages: number[]
): { valid: true } | { valid: false; sum: number } {
    const sum = percentages.reduce((acc, p) => acc + p, 0);
    const difference = Math.abs(sum - 1.0);

    if (difference > 0.0001) {
        return { valid: false, sum };
    }
    return { valid: true };
}

export function validateCustomRatio(
    ratio: number
): { valid: true } | { valid: false; error: string } {
    if (ratio < 0 || ratio > 1) {
        return { valid: false, error: `Ratio ${ratio} must be between 0.0 and 1.0` };
    }
    return { valid: true };
}

// ============================================================================
// READING SAFETY RULES
// ============================================================================

// Meters are monotonic — decreasing would indicate tampering or data error
export function validateMonotonicReading(
    newReading: number,
    previousReading: number | null
): { valid: true } | { valid: false; error: ReadingError } {
    if (previousReading === null) {
        return { valid: true };
    }
    if (newReading < previousReading) {
        return { valid: false, error: ReadingError.DECREASING_VALUE };
    }
    return { valid: true };
}

export function validateNonNegativeReading(
    value: number
): { valid: true } | { valid: false; error: ReadingError } {
    if (value < 0) {
        return { valid: false, error: ReadingError.NEGATIVE_VALUE };
    }
    return { valid: true };
}

// Combines non-negative + monotonic checks
export function validateNewReading(
    value: number,
    previousReading: number | null
): { valid: true } | { valid: false; error: ReadingError } {
    const nonNegativeCheck = validateNonNegativeReading(value);
    if (!nonNegativeCheck.valid) return nonNegativeCheck;

    const monotonicCheck = validateMonotonicReading(value, previousReading);
    if (!monotonicCheck.valid) return monotonicCheck;

    return { valid: true };
}

// ============================================================================
// COMPOSITE PARSERS
// ============================================================================

export function parseCreateBillInput(input: unknown):
    | { success: true; data: CreateUtilityBillInput }
    | { success: false; errors: z.ZodError } {
    const result = CreateUtilityBillInputSchema.safeParse(input);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
}

export function parseCreateReadingInput(input: unknown):
    | { success: true; data: CreateUtilityReadingInput }
    | { success: false; errors: z.ZodError } {
    const result = CreateUtilityReadingInputSchema.safeParse(input);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
}
