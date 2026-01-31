import { Decimal } from "@prisma/client/runtime/library";

// Standard Chart of Accounts for Property Management
export const CHART_OF_ACCOUNTS = {
    // ASSETS (1000-1999)
    CASH_IN_BANK: "1000",
    ACCOUNTS_RECEIVABLE: "1100", // Money tenants owe us
    UNDEPOSITED_FUNDS: "1200",   // Money received but not bank-cleared

    // LIABILITIES (2000-2999)
    SECURITY_DEPOSITS_LIABILITY: "2100", // Money held for tenants
    ACCOUNTS_PAYABLE: "2200",            // Money we owe vendors
    PREPAID_RENT: "2300",                // Rent paid in advance

    // EQUITY (3000-3999)
    OWNER_EQUITY: "3000",

    // INCOME (4000-4999)
    RENTAL_INCOME: "4000",
    UTILITY_RECOVERY_INCOME: "4100", // Tenant paying back utility bill
    LATE_FEES_INCOME: "4200",
    MAINTENANCE_INCOME: "4300",      // Tenant paying back damage

    // EXPENSES (5000-5999)
    MAINTENANCE_EXPENSE: "5100",     // Cost of vendor
    UTILITY_EXPENSE: "5200",         // Cost of water/power bill
    MANAGEMENT_FEES: "5300",
};

export type AccountCode = keyof typeof CHART_OF_ACCOUNTS;

export interface JournalLineInput {
    accountCode: string; // e.g. "1100" (AR) or "4000" (Income)
    description?: string;
    debit: number | Decimal;
    credit: number | Decimal;

    // Dimensions
    propertyId?: string;
    unitId?: string;
    leaseId?: string;
    tenantId?: string;
}

export interface PostJournalEntryInput {
    organizationId: string;
    date: Date;
    description: string;
    reference?: string; // "INV-101"
    lines: JournalLineInput[];
}
