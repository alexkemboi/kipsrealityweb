import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const policy = await prisma.policy.findUnique({
      where: { id: Number(id) },
      include: { Section: true },
    });
    if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    return NextResponse.json(policy);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch policy" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updatedPolicy = await prisma.policy.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json(updatedPolicy);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update policy" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params; // await the params
  const policyId = Number(id);

  if (isNaN(policyId)) {
    return NextResponse.json({ error: "Invalid policy id" }, { status: 400 });
  }

  try {
    // First delete all sections linked to the policy
    await prisma.section.deleteMany({
      where: { policyId },
    });

    // Then delete the policy itself
    await prisma.policy.delete({
      where: { id: policyId },
    });

    return NextResponse.json({ message: "Policy and its sections deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/policies/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete policy", details: error.message },
      { status: 500 }
    );
  }
}
