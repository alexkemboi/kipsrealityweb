//api/policysections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all sections
export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      include: { policy: true }, // optional if you want to see related policy
    });
    return NextResponse.json(sections);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

// POST create a new section
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, title, intro, content, order, policyId } = body;

    if (!title || !policyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newSection = await prisma.section.create({
      data: {
        key: key ?? title.toLowerCase().replace(/\s+/g, "-"),
        title,
        intro,
        content,
        order,
        policyId: Number(policyId),
      },
    });

    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
