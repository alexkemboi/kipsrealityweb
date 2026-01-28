// app/api/utilities/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/utilities/[id] -> Get utility details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: utilityId } = await params;
    const utility = await prisma.utility.findUnique({ where: { id: utilityId } });

    if (!utility) {
      return NextResponse.json({ success: false, error: "Utility not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: utility });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch utility" }, { status: 500 });
  }
}

// PUT /api/utilities/[id] -> Update utility
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: utilityId } = await params;
    const body = await req.json();
    const { name, type, unitPrice, fixedAmount } = body;

    if (!name || !type || !["FIXED", "METERED"].includes(type)) {
      return NextResponse.json({ success: false, error: "Name and valid type are required" }, { status: 400 });
    }

    // Conditional pricing validation
    if (type === "FIXED" && (fixedAmount === undefined || fixedAmount === null)) {
      return NextResponse.json({ success: false, error: "fixedAmount is required for FIXED utilities" }, { status: 400 });
    }

    if (type === "METERED" && (unitPrice === undefined || unitPrice === null)) {
      return NextResponse.json({ success: false, error: "unitPrice is required for METERED utilities" }, { status: 400 });
    }

    const updatedUtility = await prisma.utility.update({
      where: { id: utilityId },
      data: { name, type, unitPrice, fixedAmount },
    });

    return NextResponse.json({ success: true, data: updatedUtility });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/utilities/[id] -> Remove utility
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: utilityId } = await params;
    await prisma.utility.delete({ where: { id: utilityId } });
    return NextResponse.json({ success: true, message: "Utility deleted successfully" });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
