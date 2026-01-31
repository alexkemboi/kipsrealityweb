// app/api/lease-utilities/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/lease-utilities/:id -> Get lease utility assignment
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const assignment = await prisma.lease_utility.findUnique({
      where: { id },
      include: { utility: true, Lease: true },
    });

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Lease utility not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch lease utility" }, { status: 500 });
  }
}

// PUT /api/lease-utilities/:id -> Update assignment (e.g., is_tenant_responsible)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isTenantResponsible } = body;

    if (isTenantResponsible === undefined) {
      return NextResponse.json({ success: false, error: "isTenantResponsible is required" }, { status: 400 });
    }

    const updated = await prisma.lease_utility.update({
      where: { id },
      data: { is_tenant_responsible: isTenantResponsible },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/lease-utilities/:id -> Remove assignment
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.lease_utility.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Lease utility removed successfully" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
