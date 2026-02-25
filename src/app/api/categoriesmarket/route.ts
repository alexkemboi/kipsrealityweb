import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.categoryMarketplace.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("[GET /api/marketplace/categories]", error);
    return NextResponse.json(
      { error: "Failed to load marketplace categories" },
      { status: 500 }
    );
  }
}
