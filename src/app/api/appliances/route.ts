import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const appliances = await prisma.appliance.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(appliances);
  } catch (error) {
    console.error("Error fetching appliances:", error);
    return NextResponse.json(
      { error: "Failed to fetch appliances" },
      { status: 500 }
    );
  }
}