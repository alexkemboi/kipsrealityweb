import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const section = await prisma.section.findUnique({ where: { id: Number(id) } });
    if (!section) return NextResponse.json({ error: "Section not found" }, { status: 404 });
    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch section" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updatedSection = await prisma.section.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json(updatedSection);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.section.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Section deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
  }
}
