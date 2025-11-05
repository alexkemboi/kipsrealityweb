import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        features: true, // many-to-many relation
      },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET /api/plan error:", error);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      badge,
      monthlyPrice,
      yearlyPrice,
      description,
      gradient,
      featureIds = [], // existing features to connect
      newFeatures = [], // brand new ones to create
    } = body;

    const plan = await prisma.plan.create({
      data: {
        name,
        badge,
        monthlyPrice: Number(monthlyPrice),
        yearlyPrice: Number(yearlyPrice),
        description,
        gradient,
        features: {
          connect: featureIds.map((id: number) => ({ id })), // connect existing
          create: newFeatures.map((f: { title: string; description?: string }) => ({
            title: f.title,
            description: f.description,
          })), // create new
        },
      },
      include: { features: true },
    });

    return NextResponse.json(plan);
  } catch (err) {
    console.error("POST /api/plan error:", err);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
