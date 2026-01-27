import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

// GET service by ID
export async function GET(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  const id = parseInt(params.id);

  try {
    const service = await prisma.services.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (err: any) {
    console.error("GET /api/services/[id] error:", err);
    return NextResponse.json({ error: "Database error", details: err.message }, { status: 500 });
  }
}

//  PUT to update service
export async function PUT(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  const id = parseInt(params.id);

  try {
    const body = await req.json();
    const { categoryId, name, description, features, impact, icon } = body;
    const category_id = categoryId != null ? Number(categoryId) : undefined;

    const updatedService = await prisma.services.update({
      where: { id },
      data: { category_id, name, description, features, impact, icon },
    });

    return NextResponse.json(updatedService);
  } catch (err: any) {
    console.error("PUT /api/services/[id] error:", err);
    return NextResponse.json({ error: "Database error", details: err.message }, { status: 500 });
  }
}

//  DELETE a service
export async function DELETE(req: NextRequest, context: RouteContext) {
  const params = await context.params;
  const id = parseInt(params.id);

  try {
    await prisma.services.delete({ where: { id } });
    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/services/[id] error:", err);
    return NextResponse.json({ error: "Database error", details: err.message }, { status: 500 });
  }
}
