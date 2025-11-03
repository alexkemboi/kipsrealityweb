//api/plan/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Type for context allowing async params
interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

// GET /api/plan/[id]
export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const planId = Number(id);

  if (isNaN(planId)) {
    return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });
  }

  try {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { features: true },
    });

    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    return NextResponse.json(plan);
  } catch (error) {
    console.error("GET /api/plan/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const planId = Number(id);
  if (isNaN(planId)) return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });

  try {
    const data = await req.json();
    const {
      name,
      badge,
      monthlyPrice,
      yearlyPrice,
      description,
      gradient,
      featureIds = [],
    } = data;

    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        name,
        badge,
        monthlyPrice: Number(monthlyPrice),
        yearlyPrice: Number(yearlyPrice),
        description,
        gradient,
        features: {
          set: featureIds.map((id: number) => ({ id })), // replace all connections
        },
      },
      include: { features: true },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("PUT /api/plan/[id] error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}


// DELETE /api/plan/[id]
export async function DELETE(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const planId = Number(id);

  if (isNaN(planId)) {
    return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });
  }

  try {
    // Cascading delete: features will be deleted automatically if relation has `onDelete: Cascade`
    await prisma.plan.delete({ where: { id: planId } });

    return NextResponse.json({ message: "Plan and its features deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/plan/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
