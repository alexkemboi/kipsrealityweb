// Utility Bill Service — Bill Lifecycle Only
// No allocation math, no journals, no blockchain. State machine enforcement.

import { prisma } from "@/lib/db";
import { 
    UtilityBillStatus as PrismaUtilityBillStatus,
    UtilitySplitMethod as PrismaUtilitySplitMethod, 
    UtilityImportMethod as PrismaUtilityImportMethod,
    invoice_type // Ensure this matches your generated client enum name
} from "@prisma/client";
import {
    CreateBillError,
    TransitionError,
    ApproveError,
    InvoiceError,
    UtilityBillStatus,
    UtilitySplitMethod,
    UtilityImportMethod,
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

type TransitionResult = Result<
    { status: UtilityBillStatus },
    TransitionError
>;

// ============================================================================
// ENUM NORMALIZATION
// ============================================================================

function normalizeBillStatus(prismaStatus: string): UtilityBillStatus {
    switch (prismaStatus) {
        case "DRAFT":
            return UtilityBillStatus.DRAFT;
        case "PROCESSING":
            return UtilityBillStatus.PROCESSING;
        case "REVIEW_REQUIRED":
            return UtilityBillStatus.REVIEW_REQUIRED;
        case "APPROVED":
            return UtilityBillStatus.APPROVED;
        case "POSTED":
            return UtilityBillStatus.POSTED;
        case "REJECTED":
            return UtilityBillStatus.REJECTED;
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

// Build guard-compatible object from Prisma bill
function toBillForGuard(bill: { id: string; status: string; totalAmount: unknown }) {
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
                // ✅ FIX: Use camelCase field names (splitMethod, not split_method)
                splitMethod: splitMethod as PrismaUtilitySplitMethod,
                importMethod: (importMethod ?? "MANUAL_ENTRY") as PrismaUtilityImportMethod,
                fileUrl: fileUrl ?? null,       // ✅ CamelCase
                ocrConfidence: ocrConfidence ?? null,
                status: PrismaUtilityBillStatus.DRAFT,
                updatedAt: new Date(),          // ✅ CamelCase
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
        // ✅ FIX: Access via camelCase
        splitMethod: normalizeSplitMethod(bill.splitMethod), 
        createdAt: bill.createdAt, 
    };
}

// ============================================================================
// TRANSITION TO PROCESSING
// ============================================================================

export async function transitionToProcessing(billId: string): Promise<TransitionResult> {
    const bill = await prisma.utilityBill.findUnique({
        where: { id: billId },
        select: { id: true, status: true, totalAmount: true },
    });

    if (!bill) {
        return { success: false, error: TransitionError.BILL_NOT_FOUND };
    }

    assertNotPosted(toBillForGuard(bill));

    if (bill.status !== UtilityBillStatus.DRAFT) {
        return { success: false, error: TransitionError.INVALID_STATUS };
    }

    await prisma.utilityBill.update({
        where: { id: billId },
        data: {
            status: UtilityBillStatus.PROCESSING,
            updatedAt: new Date(), // ✅ CamelCase
        },
    });

    return { success: true, data: { status: UtilityBillStatus.PROCESSING } };
}

// ============================================================================
// APPROVE BILL
// ============================================================================

export async function approveBill(billId: string): Promise<ApproveBillResult> {
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

    assertNotPosted(toBillForGuard(bill));

    const allocations: UtilityAllocationResult[] = bill.allocations.map((a) => ({
        unitId: a.unitId,
        amount: Number(a.amount),
        percentage: Number(a.percentage ?? 0),
    }));

    const canApprove = canApproveBill(toBillForGuard(bill), allocations);
    if (!canApprove.allowed) {
        return { success: false, error: canApprove.error };
    }

    await prisma.$transaction(async (tx) => {
        await tx.utilityBill.update({
            where: { id: billId },
            data: {
                status: PrismaUtilityBillStatus.APPROVED,
                updatedAt: new Date(), // ✅ CamelCase
                approvedAt: new Date(), // ✅ Added tracking
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
// ============================================================================

export async function generateInvoicesForBill(
    billId: string
): Promise<GenerateInvoicesResult> {
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

    assertNotPosted(toBillForGuard(bill));

    if (bill.status !== UtilityBillStatus.APPROVED) {
        return { success: false, error: InvoiceError.INVALID_STATUS };
    }

    if (bill.allocations.length === 0) {
        return { success: false, error: InvoiceError.NO_ALLOCATIONS };
    }

    // Validation loop
    for (const alloc of bill.allocations) {
        if (!alloc.unit.leases[0]) {
            return {
                success: false,
                error: InvoiceError.ALLOCATION_MISSING_LEASE,
                message: `Unit ${alloc.unitId} has no active lease`,
            };
        }
    }

    // Idempotency check
    const existingInvoices = await prisma.invoice.count({
        where: { utilityBillId: billId },
    });

    if (existingInvoices > 0) {
        return { success: false, error: InvoiceError.ALREADY_EXISTS };
    }

    // Transaction
    const invoiceIds = await prisma.$transaction(async (tx) => {
        const ids: string[] = [];

        for (const alloc of bill.allocations) {
            const lease = alloc.unit.leases[0];

            const invoice = await tx.invoice.create({
                data: {
                    leaseId: lease.id,
                    type: invoice_type.UTILITY, // ✅ Ensure imported correctly
                    totalAmount: Number(alloc.amount), // Map Decimal to Float (Legacy compat)
                    amountPaid: 0,
                    balance: Number(alloc.amount),
                    dueDate: bill.dueDate,
                    utilityBillId: bill.id,
                    status: "PENDING", // Explicit default
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
// GET ALLOCATIONS
// ============================================================================

export async function getAllocationsForBill(
    billId: string
): Promise<UtilityAllocationResult[]> {
    // ✅ FIX: Use camelCase 'utilityBillId'
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