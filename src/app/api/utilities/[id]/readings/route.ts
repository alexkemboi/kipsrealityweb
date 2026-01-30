// GET /api/utilities/[id]/readings - Get readings for utility
// POST /api/utilities/[id]/readings - Add new reading

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: utilityId } = await params;

        // Get utility to verify it exists
        const utility = await prisma.utility.findUnique({
            where: { id: utilityId },
            select: { id: true, name: true },
        });

        if (!utility) {
            return NextResponse.json(
                { success: false, error: "Utility not found" },
                { status: 404 }
            );
        }

        // Get all readings for lease utilities that use this utility
        const readings = await prisma.utility_reading.findMany({
            where: {
                lease_utility: {
                    utility_id: utilityId,
                },
            },
            include: {
                lease_utility: {
                    include: {
                        utility: true,
                        Lease: {
                            include: {
                                tenant: true,
                                unit: true,
                                property: true,
                            },
                        },
                    },
                },
            },
            orderBy: { readingDate: "desc" },
        });

        const formatted = readings.map((r: any) => ({
            id: r.id,
            leaseUtilityId: r.lease_utility_id,
            readingValue: r.reading_value,
            amount: r.amount,
            readingDate: r.readingDate,
            createdAt: r.createdAt,
            unit: {
                id: r.lease_utility.Lease?.unit?.id,
                unitNumber: r.lease_utility.Lease?.unit?.unitNumber,
            },
            tenant: {
                name: r.lease_utility.Lease?.tenant
                    ? `${r.lease_utility.Lease.tenant.firstName ?? ""} ${r.lease_utility.Lease.tenant.lastName ?? ""}`.trim() || "Unknown"
                    : "Unknown",
            },
            property: {
                id: r.lease_utility.Lease?.property?.id,
                name: r.lease_utility.Lease?.property?.name,
            },
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error("GET readings error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch readings" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: utilityId } = await params;
        const body = await req.json();
        const { leaseUtilityId, readingValue, readingDate } = body;

        if (!leaseUtilityId || readingValue == null) {
            return NextResponse.json(
                { success: false, error: "INVALID_INPUT", message: "leaseUtilityId and readingValue are required" },
                { status: 400 }
            );
        }

        // Verify lease utility exists and uses this utility
        const leaseUtility = await prisma.lease_utility.findUnique({
            where: { id: leaseUtilityId },
            include: {
                utility: true,
                Lease: { select: { leaseStatus: true } },
            },
        });

        if (!leaseUtility) {
            return NextResponse.json(
                { success: false, error: "LEASE_UTILITY_NOT_FOUND" },
                { status: 404 }
            );
        }

        if (leaseUtility.utility_id !== utilityId) {
            return NextResponse.json(
                { success: false, error: "INVALID_INPUT", message: "Lease utility does not match utility" },
                { status: 400 }
            );
        }

        // Check lease is active
        if (leaseUtility.Lease.leaseStatus !== "ACTIVE") {
            return NextResponse.json(
                { success: false, error: "LEASE_NOT_ACTIVE" },
                { status: 400 }
            );
        }

        // Check tenant responsibility
        if (!leaseUtility.is_tenant_responsible) {
            return NextResponse.json(
                { success: false, error: "UTILITY_NOT_TENANT_RESPONSIBLE" },
                { status: 400 }
            );
        }

        // Check for negative values
        if (readingValue < 0) {
            return NextResponse.json(
                { success: false, error: "NEGATIVE_VALUE" },
                { status: 400 }
            );
        }

        // Get previous reading and validate monotonic increase
        const previous = await prisma.utility_reading.findFirst({
            where: { lease_utility_id: leaseUtilityId },
            orderBy: { readingDate: "desc" },
        });

        if (previous && readingValue < previous.reading_value) {
            return NextResponse.json(
                { success: false, error: "DECREASING_VALUE" },
                { status: 400 }
            );
        }

        // Calculate amount based on consumption
        const prevVal = previous?.reading_value ?? 0;
        const consumption = readingValue - prevVal;
        const amount = consumption * (leaseUtility.utility.unitPrice ?? 0);

        // Create reading
        const newReading = await prisma.utility_reading.create({
            data: {
                lease_utility_id: leaseUtilityId,
                reading_value: readingValue,
                readingDate: readingDate ? new Date(readingDate) : new Date(),
                amount,
            },
        });

        return NextResponse.json({
            success: true,
            data: { readingId: newReading.id },
        });
    } catch (error) {
        console.error("POST reading error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create reading" },
            { status: 500 }
        );
    }
}
