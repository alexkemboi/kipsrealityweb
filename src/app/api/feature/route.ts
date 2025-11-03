//api/feature/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "0");

    let features = await prisma.feature.findMany({
      include: { plans: true },
    });

    if (limit > 0) {
      features = features.sort(() => 0.5 - Math.random()).slice(0, limit);
    }

    return NextResponse.json(features);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch features" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, description, planId } = data; 

    const feature = await prisma.feature.create({
      data: {
        title,
        description,
        plans: planId
          ? { connect: [{ id: Number(planId) }] } 
          : undefined,
      },
      include: { plans: true },
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create feature" }, { status: 500 });
  }
}
