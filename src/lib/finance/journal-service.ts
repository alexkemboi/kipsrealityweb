import { prisma } from "@/lib/db";
import { PostEntryRequest } from "./types";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * THE POSTING ENGINE
 * Converts business logic into immutable GL records.
 */
export const journalService = {

    /**
     * Post a Double-Entry Journal to the General Ledger
     */
    async post(request: PostEntryRequest) {
        const { organizationId, date, reference, description, lines } = request;

        // 1. Validation: Debits must equal Credits
        let totalDebit = new Decimal(0);
        let totalCredit = new Decimal(0);

        lines.forEach(line => {
            totalDebit = totalDebit.add(new Decimal(line.debit));
            totalCredit = totalCredit.add(new Decimal(line.credit));
        });

        if (!totalDebit.equals(totalCredit)) {
            throw new Error(`GL Imbalance: Debit (${totalDebit}) != Credit (${totalCredit})`);
        }

        // 2. Get Financial Entity for this Org
        const entity = await prisma.financialEntity.findFirst({
            where: { organizationId }
        });

        if (!entity) throw new Error("Organization has no Financial Entity configured.");

        // 3. Resolve Account Codes to IDs (Optimization: Batch fetch)
        const codes = lines.map(l => l.accountCode);
        const accounts = await prisma.account.findMany({
            where: {
                entityId: entity.id,
                code: { in: codes }
            }
        });

        const accountMap = new Map(accounts.map(a => [a.code, a.id]));

        // 4. Prepare Transaction Data
        return await prisma.$transaction(async (tx) => {
            // Create Header
            const entry = await tx.journalEntry.create({
                data: {
                    entityId: entity.id,
                    transactionDate: date,
                    postedAt: new Date(),
                    reference,
                    description,
                    isLocked: true, // Auto-lock system entries
                    lines: {
                        create: lines.map(line => {
                            const accountId = accountMap.get(line.accountCode);
                            if (!accountId) throw new Error(`Account Code ${line.accountCode} not found.`);

                            return {
                                accountId,
                                description: line.description || description,
                                debit: line.debit,
                                credit: line.credit,
                                propertyId: line.propertyId,
                                unitId: line.unitId,
                                leaseId: line.leaseId,
                                tenantId: line.tenantId
                            };
                        })
                    }
                }
            });

            return entry;
        });
    }
};
