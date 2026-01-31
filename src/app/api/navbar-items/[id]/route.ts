import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

type UpdateBody = {
  name?: string;
  href?: string;
  order?: number;
  isVisible?: boolean;
  isAvailable?: boolean;
  parentId?: number | null;
};


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const item = await prisma.navbarItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(item, { status: 200 });
  } catch (err) {
    console.error("GET /api/navbar-items/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (Number.isNaN(numericId))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = (await req.json()) as UpdateBody;

    const allowed = ["name", "href", "order", "isVisible", "isAvailable", "parentId"];
    const updateData: any = {};
    for (const k of allowed) {
      if ((body as any)[k] !== undefined) updateData[k] = (body as any)[k];
    }

    if (updateData.order !== undefined) {
      updateData.order = Number(updateData.order);
      if (Number.isNaN(updateData.order)) {
        return NextResponse.json({ error: "Invalid order value" }, { status: 400 });
      }
    }

    // Prevent self-referencing or circular references
    if (updateData.parentId !== undefined) {
      if (updateData.parentId === numericId) {
        return NextResponse.json({ error: "Item cannot be its own parent" }, { status: 400 });
      }
      if (updateData.parentId) {
        const parentExists = await prisma.navbarItem.findUnique({
          where: { id: updateData.parentId },
        });
        if (!parentExists) {
          return NextResponse.json({ error: "Parent item not found" }, { status: 404 });
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.navbarItem.update({
      where: { id: numericId },
      data: updateData,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT /api/navbar-items/[id] error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}


export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; //  Await params
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await prisma.navbarItem.delete({ where: { id: numericId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/navbar-items/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
