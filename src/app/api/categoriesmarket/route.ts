import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.categoryMarketplace.findMany({
      select: {
        id: true,
        name: true,
        // slug: true, // include if exists
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(categories, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[GET /api/categoriesmarket]", error);

    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}
