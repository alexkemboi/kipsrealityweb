// Utility Bill Service — Bill Lifecycle Only
// No allocation math, no journals, no blockchain. State machine enforcement.

import { prisma } from "@/lib/db";
import {
    utility_bills_status,
    utility_bills_split_method,
    utility_bills_import_method,
    invoice_type,
} from "@prisma/client";
import {
    UtilityBillStatus,
    UtilitySplitMethod,
    CreateBillError,
    TransitionError,
    ApproveError,
    InvoiceError,
    type CreateUtilityBillInput,
    type CreateBillResult,
    type ApproveBillResult,
    type GenerateInvoicesResult,
    type UtilityAllocationResult,
    type Result,
} from "./utility-types";
import {
    parseCreateBillInput,
    canApproveBill,
    assertNotPosted,
} from "./utility-validators";

// ============================================================================
// ENUM NORMALIZATION
// Prisma enums stay inside services; domain enums at boundaries
// ============================================================================

function normalizeBillStatus(prismaStatus: utility_bills_status): UtilityBillStatus {
    switch (prismaStatus) {
        case utility_bills_status.DRAFT:
            return UtilityBillStatus.DRAFT;
        case utility_bills_status.PROCESSING:
            return UtilityBillStatus.PROCESSING;
        case utility_bills_status.APPROVED:
            return UtilityBillStatus.APPROVED;
        case utility_bills_status.POSTED:
            return UtilityBillStatus.POSTED;
        default:
            return UtilityBillStatus.DRAFT;
    }
}

function normalizeSplitMethod(prismaMethod: utility_bills_split_method): UtilitySplitMethod {
    switch (prismaMethod) {
        case utility_bills_split_method.EQUAL_USAGE:
            return UtilitySplitMethod.EQUAL_USAGE;
        case utility_bills_split_method.OCCUPANCY_BASED:
            return UtilitySplitMethod.OCCUPANCY_BASED;
        case utility_bills_split_method.SQ_FOOTAGE:
            return UtilitySplitMethod.SQ_FOOTAGE;
        case utility_bills_split_method.SUB_METERED:
            return UtilitySplitMethod.SUB_METERED;
        case utility_bills_split_method.CUSTOM_RATIO:
            return UtilitySplitMethod.CUSTOM_RATIO;
        default:
            return UtilitySplitMethod.EQUAL_USAGE;
    }
}

// Build guard-compatible object from Prisma bill
function toBillForGuard(bill: { id: string; status: utility_bills_status; totalAmount: unknown }) {
    return {
        id: bill.id,
        status: normalizeBillStatus(bill.status),
        totalAmount: Number(bill.totalAmount),
    };
}

// ============================================================================
// DTOs
// ============================================================================

export interface UtilityBillDTO {
    id: string;
    propertyId: string;
    providerName: string;
    totalAmount: number;
    billDate: Date;
    dueDate: Date;
    status: UtilityBillStatus;
    splitMethod: UtilitySplitMethod;
    createdAt: Date;
}

// ============================================================================
// CREATE BILL
// ============================================================================

export async function createBill(
    input: CreateUtilityBillInput
): Promise<CreateBillResult> {
    // 1. Parse and validate input
    const parsed = parseCreateBillInput(input);
    if (!parsed.success) {
        return {
            success: false,
            error: CreateBillError.INVALID_AMOUNT,
            message: parsed.errors.issues[0]?.message,
        };
    }

    const { propertyId, providerName, totalAmount, billDate, dueDate, splitMethod, importMethod, fileUrl, ocrConfidence } = parsed.data;

    // 2. Verify property exists
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true },
    });

    if (!property) {
        return { success: false, error: CreateBillError.PROPERTY_NOT_FOUND };
    }

    // 3. Create bill in DRAFT status (transactional)
    const bill = await prisma.$transaction(async (tx) => {
        return tx.utilityBill.create({
            data: {
                propertyId,
                providerName,
                totalAmount,
                billDate,
                dueDate,
                split_method: splitMethod as unknown as utility_bills_split_method,
                importMethod: (importMethod ?? "MANUAL") as unknown as utility_bills_import_method,
                file_url: fileUrl ?? null,
                ocrConfidence: ocrConfidence ?? null,
                status: utility_bills_status.DRAFT,
                updated_at: new Date(),
            },
        });
    });

    return {
        success: true,
        data: {
            billId: bill.id,
            status: UtilityBillStatus.DRAFT,
        },
    };
}

// ============================================================================
// GET BILL
// ============================================================================

export async function getBillById(billId: string): Promise<UtilityBillDTO | null> {
    const bill = await prisma.utilityBill.findUnique({
        where: { id: billId },
    });

    if (!bill) return null;

    return {
        id: bill.id,
        propertyId: bill.propertyId,
        providerName: bill.providerName,
        totalAmount: Number(bill.totalAmount),
        billDate: bill.billDate,
        dueDate: bill.dueDate,
        status: normalizeBillStatus(bill.status),
        splitMethod: normalizeSplitMethod(bill.split_method),
        createdAt: bill.created_at,
    };
}

// ============================================================================
// TRANSITION TO PROCESSING
// Called by allocation engine after allocations are created
// ============================================================================

export type TransitionResult = Result<
    { status: UtilityBillStatus },
    TransitionError
>;

export async function transitionToProcessing(billId: string): Promise<TransitionResult> {
    const bill = await prisma.utilityBill.findUnique({
        where: { id: billId },
        select: { id: true, status: true, totalAmount: true },
    });

    if (!bill) {
        return { success: false, error: TransitionError.BILL_NOT_FOUND };
    }

    // POSTED bills are immutable
    assertNotPosted(toBillForGuard(bill));

    // Only DRAFT bills can transition to PROCESSING
    if (bill.status !== utility_bills_status.DRAFT) {
        return { success: false, error: TransitionError.INVALID_STATUS };
    }

    await prisma.utilityBill.update({
        where: { id: billId },
        data: {
            status: utility_bills_status.PROCESSING,
            updated_at: new Date(),
        },
    });

    return { success: true, data: { status: UtilityBillStatus.PROCESSING } };
}

// ============================================================================
// APPROVE BILL
// ============================================================================

export async function approveBill(billId: string): Promise<ApproveBillResult> {
    // 1. Fetch bill with allocations
    const bill = await prisma.utilityBill.findUnique({
        where: { id: billId },
        include: {
            allocations: {
                select: { unitId: true, amount: true, percentage: true },
            },
        },
    });

    if (!bill) {
        return { success: false, error: ApproveError.BILL_NOT_FOUND };
    }

    // POSTED bills are immutable
    assertNotPosted(toBillForGuard(bill));

    // 2. Build allocation results for validator
    const allocations: UtilityAllocationResult[] = bill.allocations.map((a) => ({
        unitId: a.unitId,
        amount: Number(a.amount),
        percentage: Number(a.percentage ?? 0),
    }));

    // 3. Check approval rules (using normalized status)
    const canApprove = canApproveBill(toBillForGuard(bill), allocations);
    if (!canApprove.allowed) {
        return { success: false, error: canApprove.error };
    }

    // 4. Update to APPROVED (transactional)
    await prisma.$transaction(async (tx) => {
        await tx.utilityBill.update({
            where: { id: billId },
            data: {
                status: utility_bills_status.APPROVED,
                updated_at: new Date(),
            },
        });
    });

    return {
        success: true,
        data: {
            billId: bill.id,
            status: UtilityBillStatus.APPROVED,
        },
    };
}

// ============================================================================
// GENERATE INVOICES
// Creates one invoice per allocation — no math, just records
// IMPORTANT: Bill remains APPROVED after invoice generation.
// Posting to GL is handled separately by accounting service.
// ============================================================================

export async function generateInvoicesForBill(
    billId: string
): Promise<GenerateInvoicesResult> {
    // 1. Fetch bill with allocations
    const bill = await prisma.utilityBill.findUnique({
        where: { id: billId },
        include: {
            allocations: {
                include: {
                    unit: {
                        include: {
                            leases: {
                                where: { leaseStatus: "ACTIVE" },
                                take: 1,
                            },
                        },
                    },
                },
            },
        },
    });

    if (!bill) {
        return { success: false, error: InvoiceError.BILL_NOT_FOUND };
    }

    // POSTED bills are immutable — cannot generate more invoices
    assertNotPosted(toBillForGuard(bill));

    // 2. Must be APPROVED to generate invoices
    if (bill.status !== utility_bills_status.APPROVED) {
        return { success: false, error: InvoiceError.INVALID_STATUS };
    }

    // 3. Must have allocations
    if (bill.allocations.length === 0) {
        return { success: false, error: InvoiceError.NO_ALLOCATIONS };
    }

    // 4. Each allocation must have an active lease
    for (const alloc of bill.allocations) {
        if (!alloc.unit.leases[0]) {
            return {
                success: false,
                error: InvoiceError.ALLOCATION_MISSING_LEASE,
                message: `Unit ${alloc.unitId} has no active lease`,
            };
        }
    }

    // 5. Check if invoices already exist (idempotency guard)
    const existingInvoices = await prisma.invoice.count({
        where: { utilityBillId: billId },
    });

    if (existingInvoices > 0) {
        return { success: false, error: InvoiceError.ALREADY_EXISTS };
    }

    // 6. Create invoices in transaction
    const invoiceIds = await prisma.$transaction(async (tx) => {
        const ids: string[] = [];

        for (const alloc of bill.allocations) {
            const lease = alloc.unit.leases[0];

            const invoice = await tx.invoice.create({
                data: {
                    leaseId: lease.id,
                    type: invoice_type.UTILITY,
                    totalAmount: Number(alloc.amount),
                    amountPaid: 0,
                    balance: Number(alloc.amount),
                    dueDate: bill.dueDate,
                    utilityBillId: bill.id,
                },
            });

            // Link allocation to invoice
            await tx.utilityAllocation.update({
                where: { id: alloc.id },
                data: { invoiceId: invoice.id },
            });

            ids.push(invoice.id);
        }

        return ids;
    });

    return {
        success: true,
        data: {
            invoiceIds,
            count: invoiceIds.length,
        },
    };
}

// ============================================================================
// TEMPORARY BRIDGE — Get allocations for a bill
// TODO: Move to allocation service when implemented
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
