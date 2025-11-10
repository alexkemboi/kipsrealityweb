import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; 

// GET all services or by category_id
export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get("category_id");
  try {
    const services = await prisma.services.findMany({
      where: categoryId ? { category_id: parseInt(categoryId) } : {},
    });
    return NextResponse.json(services);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category_id, name, description, features, impact, icon } = body;

    const service = await prisma.services.create({
      data: {
        category_id,
        name,
        description,
        features,
        impact,
        icon,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}
