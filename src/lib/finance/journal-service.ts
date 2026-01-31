import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import { PostJournalEntryInput } from './types';

export const journalService = {
    /**
     * Post a Journal Entry to the General Ledger.
     * THROWS ERROR if Debits != Credits.
     * Accepts an optional transaction client (tx) for atomic operations.
     */
    async post(input: PostJournalEntryInput, prismaTx?: any) {
        const { organizationId, date, description, reference, lines } = input;
        const client = prismaTx || prisma;

        // 1. Get Financial Entity for this Org
        const entity = await client.financialEntity.findFirst({
            where: { organizationId },
            include: { accounts: true },
        });

        if (!entity) throw new Error(`Financial Entity not found for Org: ${organizationId}`);

        // 2. Validate Double-Entry Math (Debits MUST equal Credits)
        let totalDebit = new Decimal(0);
        let totalCredit = new Decimal(0);

        lines.forEach((line) => {
            totalDebit = totalDebit.plus(new Decimal(line.debit));
            totalCredit = totalCredit.plus(new Decimal(line.credit));
        });

        if (!totalDebit.equals(totalCredit)) {
            throw new Error(
                `GL IMBALANCE: Debits ($${totalDebit}) do not equal Credits ($${totalCredit}). Transaction blocked.`
            );
        }

        // 3. Resolve Account IDs from Codes
        // We map "1100" to the actual UUID in the database
        const lineData = lines.map((line) => {
            const account = entity.accounts.find((a: any) => a.code === line.accountCode);
            if (!account) {
                throw new Error(`Account Code ${line.accountCode} not configured for this entity.`);
            }

            return {
                accountId: account.id,
                description: line.description || description,
                debit: line.debit,
                credit: line.credit,
                propertyId: line.propertyId,
                unitId: line.unitId,
                leaseId: line.leaseId,
                tenantId: line.tenantId,
            };
        });

        // 4. Write to Database (Atomic Transaction or part of parent tx)
        // Helper to create entry using any client (tx or prisma)
        const createEntry = async (tx: any) => {
            return await tx.journalEntry.create({
                data: {
                    entityId: entity.id,
                    transactionDate: date,
                    postedAt: new Date(), // Now
                    description,
                    reference,
                    isLocked: true, // Auto-lock system entries
                    lines: {
                        create: lineData,
                    },
                },
            });
        };

        if (prismaTx) {
            return await createEntry(prismaTx);
        } else {
            return await prisma.$transaction(async (tx) => {
                return await createEntry(tx);
            });
        }
    },
};
