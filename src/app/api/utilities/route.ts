// app/api/utilities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/utilities -> List all utilities
export async function GET() {
  try {
    const utilities = await prisma.utility.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: utilities });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch utilities" }, { status: 500 });
  }
}

// POST /api/utilities -> Add new utility
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, unitPrice, fixedAmount } = body;

    if (!name || !type || !["FIXED", "METERED"].includes(type)) {
      return NextResponse.json({ success: false, error: "Name and valid type are required" }, { status: 400 });
    }

    // Conditional pricing validation
    if (type === "FIXED" && (fixedAmount === undefined || fixedAmount === null)) {
      return NextResponse.json({ success: false, error: "fixedAmount is required for FIXED utilities" }, { status: 400 });
    }

    if (type === "METERED" && (unitPrice === undefined || unitPrice === null)) {
      return NextResponse.json({ success: false, error: "unitPrice is required for METERED utilities" }, { status: 400 });
    }

    const newUtility = await prisma.utility.create({
      data: { name, type, unitPrice, fixedAmount },
    });

    return NextResponse.json({ success: true, data: newUtility });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
