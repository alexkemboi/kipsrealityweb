import { Decimal } from "@prisma/client/runtime/library";

export interface JournalLineRequest {
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

export interface PostEntryRequest {
    organizationId: string;
    date: Date;
    reference: string; // "INV-101"
    description: string; // "Rent Invoice for Jan"
    lines: JournalLineRequest[];
}
