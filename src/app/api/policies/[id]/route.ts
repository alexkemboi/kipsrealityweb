//api/policies/[id]/Route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const policy = await prisma.policy.findUnique({
      where: { id: Number(params.id) },
      include: { sections: true },
    });
    if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    return NextResponse.json(policy);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch policy" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updatedPolicy = await prisma.policy.update({
      where: { id: Number(params.id) },
      data: body,
    });
    return NextResponse.json(updatedPolicy);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update policy" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.policy.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "Policy deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete policy" }, { status: 500 });
  }
}
