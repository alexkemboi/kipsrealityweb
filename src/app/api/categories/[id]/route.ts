import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET a single category by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { services: true },
    });
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}

// PUT to update a category
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  try {
    const body = await req.json();
    const { name, tagline, color } = body;

    const updated = await prisma.category.update({
      where: { id },
      data: { name, tagline, color },
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}

// DELETE a category
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}
