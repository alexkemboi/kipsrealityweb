import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: { features: true }, // include features for each plan
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Destructure and cast numeric values
    const {
      name,
      badge,
      monthlyPrice,
      yearlyPrice,
      description,
      gradient,
      features = [], // optional array of features
    } = body;

    // Prepare features for nested creation
    const featuresData = features.map((f: { title: string; description: string }) => ({
      title: f.title,
      description: f.description,
    }));

    const plan = await prisma.plan.create({
      data: {
        name,
        badge,
        monthlyPrice: Number(monthlyPrice),
        yearlyPrice: Number(yearlyPrice),
        description,
        gradient,
        features: {
          create: featuresData, // nested creation
        },
      },
      include: {
        features: true, // return features in the response
      },
    });

    return NextResponse.json(plan);
  } catch (err) {
    console.error("POST /api/plan error:", err);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
