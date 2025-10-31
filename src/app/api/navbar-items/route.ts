import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

// Optional: define body type for type safety
interface CreateNavbarItemBody {
  name: string;
  href: string;
  order?: number | string;
  isVisible?: boolean;
  isAvailable?: boolean;
}

//  GET: list all navbar items (ordered)
export async function GET(req: NextRequest) {
  try {
    const items = await prisma.navbarItem.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("GET /api/navbar-items error:", err);
    return NextResponse.json({ error: "Failed to fetch navbar items" }, { status: 500 });
  }
}

//  POST: create a new navbar item
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateNavbarItemBody;

    // validation
    if (!body?.name || !body?.href) {
      return NextResponse.json({ error: "name and href are required" }, { status: 400 });
    }

    // ensure order is a number
    const parsedOrder = body.order ? Number(body.order) : 0;

    const newItem = await prisma.navbarItem.create({
      data: {
        name: body.name.trim(),
        href: body.href.trim(),
        order: parsedOrder,
        isVisible: body.isVisible ?? true,
        isAvailable: body.isAvailable ?? true,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    console.error("POST /api/navbar-items error:", err);
    return NextResponse.json({ error: "Failed to create navbar item" }, { status: 500 });
  }
}
