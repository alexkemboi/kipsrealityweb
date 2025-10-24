import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all services or by category_id
export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get("category_id");
  try {
    const services = await prisma.service.findMany({
      where: categoryId ? { categoryId: parseInt(categoryId) } : {},
    });
    return NextResponse.json(services);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}

// POST a new service
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryId, name, description, features, impact, icon } = body;

    const service = await prisma.service.create({
      data: {
        categoryId,
        name,
        description,
        features,
        impact,
        icon,
      },
    });

    return NextResponse.json(service);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}
