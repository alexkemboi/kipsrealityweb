import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { NextRequest } from "next/server";

type ReorderBody = {
  items: { id: number; order: number }[];
};

export async function POST(req: NextRequest) {
  try {

    const body = (await req.json()) as ReorderBody;
    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updates = body.items.map(({ id, order }) =>
      prisma.navbarItem.update({
        where: { id },
        data: { order },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/navbar-items/reorder error:", err);
    return NextResponse.json({ error: "Failed to reorder items" }, { status: 500 });
  }
}
