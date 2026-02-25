import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.categoryMarketplace.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("[GET /api/appliances]", error);

    return NextResponse.json(
      { error: "Failed to load appliance categories" },
      { status: 500 }
    );
  }
}
