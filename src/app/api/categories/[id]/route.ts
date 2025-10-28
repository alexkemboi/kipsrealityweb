import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Allow async params handling
interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

//  GET category by ID
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const categoryId = parseInt(id, 10);

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (err: any) {
    console.error("GET /api/categories/[id] error:", err);
    return NextResponse.json(
      { error: "Database error", details: err.message },
      { status: 500 }
    );
  }
}

//  PUT /api/categories/[id]
export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const categoryId = parseInt(id, 10);

  try {
    const body = await req.json();
    const { name, tagline, color } = body;

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name, tagline, color },
    });

    return NextResponse.json(updatedCategory);
  } catch (err: any) {
    console.error("PUT /api/categories/[id] error:", err);
    return NextResponse.json(
      { error: "Database error", details: err.message },
      { status: 500 }
    );
  }
}

//  DELETE /api/categories/[id]
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const categoryId = parseInt(id, 10);

  try {
    await prisma.category.delete({ where: { id: categoryId } });
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/categories/[id] error:", err);
    return NextResponse.json(
      { error: "Database error", details: err.message },
      { status: 500 }
    );
  }
}
