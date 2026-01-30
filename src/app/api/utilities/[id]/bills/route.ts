// GET /api/utilities/[id]/bills - Get bills for utility
// POST /api/utilities/[id]/bills - Create new bill

import { NextRequest, NextResponse } from "next/server";
import { createBill } from "@/lib/utilities/utility-bill-service";
import { prisma } from "@/lib/db";
import { UtilitySplitMethod } from "@/lib/utilities/utility-types";
import { UtilityBill, Property, UtilityAllocation } from "@prisma/client";

type BillWithRelations = UtilityBill & {
    property: Pick<Property, 'id' | 'name'> | null;
    allocations: Pick<UtilityAllocation, 'id'>[];
};

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: utilityId } = await params;

        // Verify utility exists
        const utility = await prisma.utility.findUnique({
            where: { id: utilityId },
            select: { id: true, name: true },
        });

        if (!utility) {
            return NextResponse.json({ success: false, error: "Utility not found" }, { status: 404 });
        }

        // Fetch bills - UtilityBill is linked to property, not directly to utility
        // For now, return all bills (TODO: filter by utility when schema supports it)
        const bills = await prisma.utilityBill.findMany({
            include: {
                property: { select: { id: true, name: true } },
                allocations: { select: { id: true } }
            },
            orderBy: { billDate: "desc" },
        });

        const formatted = bills.map((bill: BillWithRelations) => ({
            id: bill.id,
            propertyId: bill.propertyId,
            propertyName: bill.property?.name,
            providerName: bill.providerName,
            totalAmount: Number(bill.totalAmount),
            billDate: bill.billDate,
            dueDate: bill.dueDate,
            status: bill.status,
            splitMethod: bill.splitMethod, 
            createdAt: bill.createdAt,    
            allocationsCount: bill.allocations.length
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error("GET bills error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch bills" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await params; // Await params even if not used directly
        const body = await req.json();

        const {
            propertyId,
            providerName,
            totalAmount,
            billDate,
            dueDate,
            splitMethod
        } = body;

        // Basic validation
        if (!propertyId || !providerName || !totalAmount || !billDate || !dueDate || !splitMethod) {
            return NextResponse.json(
                { success: false, error: "INVALID_INPUT", message: "Missing required fields" },
                { status: 400 }
            );
        }

        if (totalAmount <= 0) {
            return NextResponse.json(
                { success: false, error: "INVALID_AMOUNT", message: "Amount must be positive" },
                { status: 400 }
            );
        }

        if (new Date(dueDate) < new Date(billDate)) {
            return NextResponse.json(
                { success: false, error: "INVALID_DATES", message: "Due date cannot be before bill date" },
                { status: 400 }
            );
        }

        // Call service
        const result = await createBill({
            propertyId,
            providerName,
            totalAmount,
            billDate: new Date(billDate),
            dueDate: new Date(dueDate),
            splitMethod: splitMethod as UtilitySplitMethod
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, message: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, data: result.data }, { status: 201 });

    } catch (error) {
        console.error("POST bill error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create bill" },
            { status: 500 }
        );
    }
}
