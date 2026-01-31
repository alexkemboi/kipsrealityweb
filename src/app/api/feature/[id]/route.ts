import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Allow async params handling
interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/feature/[id]
export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const featureId = Number(id);

  if (isNaN(featureId)) {
    return NextResponse.json({ error: "Invalid feature id" }, { status: 400 });
  }

  try {
    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
      include: { plans: true },
    });

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    return NextResponse.json(feature);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch feature" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const featureId = Number(id);

  if (isNaN(featureId)) {
    return NextResponse.json({ error: "Invalid feature id" }, { status: 400 });
  }

  try {
    const data = await req.json();
    const { title, description, planId } = data; // single planId from frontend

    const feature = await prisma.feature.update({
      where: { id: featureId },
      data: {
        title,
        description,
        plans: planId
          ? { set: [{ id: Number(planId) }] }
          : undefined,
      },
      include: { plans: true },
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error("PUT /api/feature/[id] error:", error);
    return NextResponse.json({ error: "Failed to update feature" }, { status: 500 });
  }
}

// DELETE /api/feature/[id]
export async function DELETE(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const featureId = Number(id);

  if (isNaN(featureId)) {
    return NextResponse.json({ error: "Invalid feature id" }, { status: 400 });
  }

  try {
    await prisma.feature.delete({ where: { id: featureId } });
    return NextResponse.json({ message: "Feature deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete feature" }, { status: 500 });
  }
}
