import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all categories with services
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { services: true },
    });
    return NextResponse.json(categories);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}

// POST a new category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, tagline, color } = body;

    const category = await prisma.category.create({
      data: { name, tagline, color },
    });
    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}
