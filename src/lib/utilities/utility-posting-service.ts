// Utility Posting Service — Financial Posting Only
// Final step in utility bill lifecycle: APPROVED → POSTED
// Creates journal entries, computes audit hash, marks bill immutable.
// No allocation logic, no invoice creation.

import { prisma } from "@/lib/db";
import { createHash } from "crypto";
import { 
    UtilityBillStatus, 
    UtilityAllocationResult,
    PostBillResult,
    PostError 
} from "./utility-types";
import { assertNotPosted } from "./utility-validators";
import { getAllocationsForBill } from "./utility-allocation-service";
import { journalService } from "@/lib/finance/journal-service";

// ============================================================================
// ACCOUNT CODES (should match Chart of Accounts)
// ============================================================================

const ACCOUNT_CODES = {
    UTILITY_EXPENSE: "6100", // Debit: Utility Expense
    ACCOUNTS_PAYABLE: "2000", // Credit: Accounts Payable
};

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

function toBillForGuard(bill: { id: string; status: string; totalAmount: unknown }) {
    return {
        id: bill.id,
        status: normalizeBillStatus(bill.status),
        totalAmount: Number(bill.totalAmount),
    };
}

// ============================================================================
// BLOCKCHAIN HASH COMPUTATION
// SHA-256 hash of allocations for audit trail
// ============================================================================

function computeAllocationHash(allocations: UtilityAllocationResult[]): string {
    const payload = allocations
        .map((a) => `${a.unitId}:${a.amount}:${a.percentage}`)
        .sort() // Deterministic ordering
        .join("|");

    return createHash("sha256").update(payload).digest("hex");
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

export async function postUtilityBill(
    billId: string,
    organizationId: string
): Promise<PostBillResult> {
    // 1. Fetch bill
    const bill = await prisma.utilityBill.findUnique({
        where: { id: billId },
        include: {
            property: { select: { id: true } },
        },
    });

    if (!bill) {
        return { success: false, error: PostError.BILL_NOT_FOUND };
    }

    // 2. POSTED bills are immutable — idempotency guard
    try {
        assertNotPosted(toBillForGuard(bill));
    } catch {
        return { success: false, error: PostError.ALREADY_POSTED };
    }

    // 3. Only APPROVED bills can be posted
    if (bill.status !== UtilityBillStatus.APPROVED) {
        return { success: false, error: PostError.NOT_APPROVED };
    }

    // 4. Fetch allocations (read-only, outside transaction is OK)
    const allocations = await getAllocationsForBill(billId);
    if (allocations.length === 0) {
        return { success: false, error: PostError.NO_ALLOCATIONS };
    }

    // 5. Compute blockchain hash for audit (deterministic, cannot fail on valid allocations)
    const blockchainHash = computeAllocationHash(allocations);

    // 6. Create journal entry via journalService
    const totalAmount = Number(bill.totalAmount);
    let journalEntryId: string;

    try {
        const journalEntry = await journalService.post({
            organizationId,
            date: bill.billDate,
            reference: `UTIL-${billId.slice(0, 8)}`,
            description: `Utility Bill: ${bill.providerName}`,
            lines: [
                {
                    accountCode: ACCOUNT_CODES.UTILITY_EXPENSE,
                    description: `Utility expense - ${bill.providerName}`,
                    debit: totalAmount,
                    credit: 0,
                    propertyId: bill.propertyId,
                },
                {
                    accountCode: ACCOUNT_CODES.ACCOUNTS_PAYABLE,
                    description: `Accounts payable - ${bill.providerName}`,
                    debit: 0,
                    credit: totalAmount,
                    propertyId: bill.propertyId,
                },
            ],
        });

        journalEntryId = journalEntry.id;
    } catch (error) {
        // Check if it's a missing financial entity error
        const message = error instanceof Error ? error.message : "Unknown error";
        if (message.includes("Financial Entity")) {
            return { success: false, error: PostError.NO_FINANCIAL_ENTITY };
        }
        return {
            success: false,
            error: PostError.JOURNAL_FAILED,
            message,
        };
    }

    // 7. Update bill to POSTED (within transaction for atomicity)
    await prisma.$transaction(async (tx) => {
        await tx.utilityBill.update({
            where: { id: billId },
            data: {
                status: UtilityBillStatus.POSTED,
                journalEntryId: journalEntryId,
                blockchainHash: blockchainHash,
                updatedAt: new Date(),
            },
        });
    });

    return {
        success: true,
        data: {
            billId,
            status: UtilityBillStatus.POSTED,
            journalEntryId,
            blockchainHash,
        },
    };
}

// ============================================================================
// HELPER — Check if bill is already posted
// ============================================================================

export async function isBillPosted(billId: string): Promise<boolean> {
    const bill = await prisma.utilityBill.findUnique({
        where: { id: billId },
        select: { status: true },
    });

    return bill?.status === UtilityBillStatus.POSTED;
}
