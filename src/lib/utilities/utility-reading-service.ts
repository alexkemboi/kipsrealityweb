// Utility Reading Service — Raw Meter Data Only
// No billing, no invoices, no accounting. Just readings.

import { prisma } from "@/lib/db";
import { Lease_leaseStatus } from "@prisma/client";
import {
    ReadingError,
    type CreateUtilityReadingInput,
    type CreateReadingResult,
} from "./utility-types";
import {
    parseCreateReadingInput,
    validateNewReading,
} from "./utility-validators";

// DTO for reading responses
export interface UtilityReadingDTO {
    id: string;
    leaseUtilityId: string;
    readingValue: number;
    readingDate: Date;
    createdAt: Date;
}

// Record a new meter reading — append-only, no updates/deletes
export async function createReading(
    input: CreateUtilityReadingInput
): Promise<CreateReadingResult> {
    // 1. Parse and validate input shape
    const parsed = parseCreateReadingInput(input);
    if (!parsed.success) {
        return {
            success: false,
            error: ReadingError.INVALID_INPUT,
            message: parsed.errors.issues[0]?.message,
        };
    }

    const { leaseUtilityId, readingValue, readingDate } = parsed.data;

    // 2. Fetch lease utility with related lease
    const leaseUtility = await prisma.lease_utility.findUnique({
        where: { id: leaseUtilityId },
        include: {
            Lease: { select: { leaseStatus: true } },
        },
    });

    if (!leaseUtility) {
        return { success: false, error: ReadingError.LEASE_UTILITY_NOT_FOUND };
    }

    // 3. Enforce lease is active
    if (leaseUtility.Lease.leaseStatus !== Lease_leaseStatus.ACTIVE) {
        return { success: false, error: ReadingError.LEASE_NOT_ACTIVE };
    }

    // 4. Enforce tenant responsibility
    if (!leaseUtility.is_tenant_responsible) {
        return { success: false, error: ReadingError.UTILITY_NOT_TENANT_RESPONSIBLE };
    }

    // 5. Fetch previous reading (latest by date)
    const previousReading = await prisma.utility_reading.findFirst({
        where: { lease_utility_id: leaseUtilityId },
        orderBy: { readingDate: "desc" },
        select: { reading_value: true },
    });

    // 6. Validate reading rules (non-negative, monotonic)
    const readingCheck = validateNewReading(
        readingValue,
        previousReading?.reading_value ?? null
    );
    if (!readingCheck.valid) {
        return { success: false, error: readingCheck.error };
    }

    // 7. Insert reading in transaction (append-only)
    const newReading = await prisma.$transaction(async (tx) => {
        return tx.utility_reading.create({
            data: {
                lease_utility_id: leaseUtilityId,
                reading_value: readingValue,
                readingDate: readingDate ?? new Date(),
                amount: null, // readings are data, not money
            },
        });
    });

    return {
        success: true,
        data: { readingId: newReading.id },
    };
}

// Get all readings for a lease utility — read-only, ordered by date
export async function getReadingsForLeaseUtility(
    leaseUtilityId: string
): Promise<{ readings: UtilityReadingDTO[] }> {
    const readings = await prisma.utility_reading.findMany({
        where: { lease_utility_id: leaseUtilityId },
        orderBy: { readingDate: "asc" },
    });

    return {
        readings: readings.map((r: any) => ({
            id: r.id,
            leaseUtilityId: r.lease_utility_id,
            readingValue: r.reading_value,
            readingDate: r.readingDate ?? new Date(),
            createdAt: r.createdAt ?? new Date(),
        })),
    };
}
