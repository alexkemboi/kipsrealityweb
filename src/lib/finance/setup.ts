import { prisma } from '@/lib/db';
import { CHART_OF_ACCOUNTS } from './types';
import { AccountType } from '@prisma/client';

/**
 * Creates a Financial Entity and Default Chart of Accounts for an Organization.
 * Run this when a Property Manager signs up.
 */
export async function setupFinancials(organizationId: string, orgName: string) {
    // 1. Create Entity
    const entity = await prisma.financialEntity.create({
        data: {
            organizationId,
            name: `${orgName} Financials`,
        },
    });

    // 2. Create Default Accounts
    const accountsToCreate = [
        { code: CHART_OF_ACCOUNTS.CASH_IN_BANK, name: "Cash in Bank", type: AccountType.ASSET },
        { code: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE, name: "Accounts Receivable", type: AccountType.ASSET },
        { code: CHART_OF_ACCOUNTS.UNDEPOSITED_FUNDS, name: "Undeposited Funds", type: AccountType.ASSET },
        { code: CHART_OF_ACCOUNTS.SECURITY_DEPOSITS_LIABILITY, name: "Security Deposits Held", type: AccountType.LIABILITY },
        { code: CHART_OF_ACCOUNTS.ACCOUNTS_PAYABLE, name: "Accounts Payable", type: AccountType.LIABILITY },
        { code: CHART_OF_ACCOUNTS.PREPAID_RENT, name: "Prepaid Rent", type: AccountType.LIABILITY },
        { code: CHART_OF_ACCOUNTS.OWNER_EQUITY, name: "Owner Equity", type: AccountType.EQUITY },
        { code: CHART_OF_ACCOUNTS.RENTAL_INCOME, name: "Rental Income", type: AccountType.INCOME },
        { code: CHART_OF_ACCOUNTS.UTILITY_RECOVERY_INCOME, name: "Utility Recovery", type: AccountType.INCOME },
        { code: CHART_OF_ACCOUNTS.LATE_FEES_INCOME, name: "Late Fees Income", type: AccountType.INCOME },
        { code: CHART_OF_ACCOUNTS.MAINTENANCE_INCOME, name: "Maintenance Income", type: AccountType.INCOME },
        { code: CHART_OF_ACCOUNTS.MAINTENANCE_EXPENSE, name: "Maintenance Expense", type: AccountType.EXPENSE },
        { code: CHART_OF_ACCOUNTS.UTILITY_EXPENSE, name: "Utility Cost", type: AccountType.EXPENSE },
        { code: CHART_OF_ACCOUNTS.MANAGEMENT_FEES, name: "Management Fees", type: AccountType.EXPENSE },
    ];

    for (const acc of accountsToCreate) {
        await prisma.account.create({
            data: {
                entityId: entity.id,
                code: acc.code,
                name: acc.name,
                type: acc.type,
                isSystem: true,
            },
        });
    }

    return entity;
}
