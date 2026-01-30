// Utility Billing Module - Shared Type Contracts
// Zero external dependencies. Framework-agnostic.

/** Bill lifecycle states */
export enum UtilityBillStatus {
    DRAFT = "DRAFT",
    PROCESSING = "PROCESSING",
    REVIEW_REQUIRED = "REVIEW_REQUIRED",
    APPROVED = "APPROVED",
    POSTED = "POSTED",
    REJECTED = "REJECTED",
}

/** Strategies for splitting bills across units */
export enum UtilitySplitMethod {
    EQUAL = "EQUAL",
    OCCUPANCY_BASED = "OCCUPANCY_BASED",
    SQ_FOOTAGE = "SQ_FOOTAGE",
    SUB_METERED = "SUB_METERED",
    /** Ratios must be decimals (0.0 to 1.0) that sum to 1.0 across all units */
    CUSTOM_RATIO = "CUSTOM_RATIO",
    AI_OPTIMIZED = "AI_OPTIMIZED",
}

/** How the bill was imported into the system */
export enum UtilityImportMethod {
    CSV = "CSV",
    API = "API",
    PDF_OCR = "PDF_OCR",
    MANUAL_ENTRY = "MANUAL_ENTRY",
    IMAGE_SCAN = "IMAGE_SCAN",
}

/** Discriminated union for typed success/error handling */
export type Result<T, E extends string> =
    | { success: true; data: T }
    | { success: false; error: E; message?: string };

/** Input for creating a new utility bill */
export interface CreateUtilityBillInput {
    propertyId: string;
    providerName: string;
    totalAmount: number;
    billDate: Date;
    dueDate: Date;
    splitMethod: UtilitySplitMethod;
    importMethod?: UtilityImportMethod;
    fileUrl?: string;
    ocrConfidence?: number;
}

/** Input for recording a meter reading */
export interface CreateUtilityReadingInput {
    leaseUtilityId: string;
    readingValue: number;
    readingDate?: Date;
}

/** Context for a single unit during allocation calculation */
export interface UtilitySplitContext {
    unitId: string;
    leaseId: string | null;
    sqFootage: number | null;
    occupantCount: number | null;
    meterReading: number | null;
    /** Decimal between 0.0 and 1.0. All unit ratios must sum to 1.0. */
    customRatio: number | null;
}

/** Result of allocating a portion of the bill to a unit */
export interface UtilityAllocationResult {
    unitId: string;
    amount: number;
    percentage: number;
}

/** Errors during bill creation */
export enum CreateBillError {
    INVALID_PROPERTY = "INVALID_PROPERTY",
    INVALID_DATES = "INVALID_DATES",
    INVALID_AMOUNT = "INVALID_AMOUNT",
    PROPERTY_NOT_FOUND = "PROPERTY_NOT_FOUND",
}

/** Errors during meter reading creation */
export enum ReadingError {
    INVALID_INPUT = "INVALID_INPUT",
    LEASE_UTILITY_NOT_FOUND = "LEASE_UTILITY_NOT_FOUND",
    LEASE_NOT_ACTIVE = "LEASE_NOT_ACTIVE",
    UTILITY_NOT_TENANT_RESPONSIBLE = "UTILITY_NOT_TENANT_RESPONSIBLE",
    NEGATIVE_VALUE = "NEGATIVE_VALUE",
    DECREASING_VALUE = "DECREASING_VALUE",
}

/** Errors during bill allocation */
export enum AllocateError {
    BILL_NOT_FOUND = "BILL_NOT_FOUND",
    INVALID_STATUS = "INVALID_STATUS",
    INVALID_AMOUNT = "INVALID_AMOUNT",
    NO_UNITS_FOUND = "NO_UNITS_FOUND",
    MISSING_SPLIT_DATA = "MISSING_SPLIT_DATA",
    SUM_MISMATCH = "SUM_MISMATCH",
    ALREADY_ALLOCATED = "ALREADY_ALLOCATED",
}

/** Errors during bill state transitions */
export enum TransitionError {
    BILL_NOT_FOUND = "BILL_NOT_FOUND",
    INVALID_STATUS = "INVALID_STATUS",
    BILL_ALREADY_POSTED = "BILL_ALREADY_POSTED",
}

/** Errors during bill approval */
export enum ApproveError {
    BILL_NOT_FOUND = "BILL_NOT_FOUND",
    INVALID_STATUS = "INVALID_STATUS",
    NO_ALLOCATIONS = "NO_ALLOCATIONS",
    ALLOCATION_SUM_MISMATCH = "ALLOCATION_SUM_MISMATCH",
}

/** Errors during invoice generation */
export enum InvoiceError {
    BILL_NOT_FOUND = "BILL_NOT_FOUND",
    INVALID_STATUS = "INVALID_STATUS",
    NO_ALLOCATIONS = "NO_ALLOCATIONS",
    ALLOCATION_MISSING_LEASE = "ALLOCATION_MISSING_LEASE",
    ALREADY_EXISTS = "ALREADY_EXISTS",
}

/** Errors during financial posting */
export enum PostError {
    BILL_NOT_FOUND = "BILL_NOT_FOUND",
    NOT_APPROVED = "NOT_APPROVED",
    ALREADY_POSTED = "ALREADY_POSTED",
    NO_ALLOCATIONS = "NO_ALLOCATIONS",
    JOURNAL_FAILED = "JOURNAL_FAILED",
    HASH_FAILED = "HASH_FAILED",
    NO_FINANCIAL_ENTITY = "NO_FINANCIAL_ENTITY",
}

/** Result of createUtilityBill() */
export type CreateBillResult = Result<
    { billId: string; status: UtilityBillStatus },
    CreateBillError
>;

/** Result of createReading() */
export type CreateReadingResult = Result<
    { readingId: string },
    ReadingError
>;

/** Result of allocateUtilityBill() */
export type AllocateBillResult = Result<
    { allocations: UtilityAllocationResult[]; status: UtilityBillStatus },
    AllocateError
>;

/** Result of approveUtilityBill() */
export type ApproveBillResult = Result<
    { billId: string; status: UtilityBillStatus },
    ApproveError
>;

/** Result of generateInvoicesForBill() */
export type GenerateInvoicesResult = Result<
    { invoiceIds: string[]; count: number },
    InvoiceError
>;

/** Result of postUtilityBill() */
export type PostBillResult = Result<
    {
        billId: string;
        status: UtilityBillStatus;
        journalEntryId: string;
        blockchainHash: string | null;
    },
    PostError
>;
