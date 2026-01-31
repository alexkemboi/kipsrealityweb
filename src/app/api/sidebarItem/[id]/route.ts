import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}


export async function GET(req: Request, context: RouteContext) {
  const { id: idStr } = await context.params;
  const id = Number(idStr);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const item = await prisma.sidebarItem.findUnique({
      where: { id },
      include: { feature: true, plans: true },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch sidebar item" }, { status: 500 });
  }
}


// app/api/sidebarItem/[id]/route.ts
export async function PUT(req: Request, context: RouteContext) {
  const { id: idStr } = await context.params;
  const id = Number(idStr);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const data = await req.json();
    const {
      label,
      path,
      role, // ADD THIS
      icon,
      section,
      order,
      badge,
      description,
      isActive,
      isExternal,
      target,
      featureId,
      planIds = [],
    } = data;

    const updatedItem = await prisma.sidebarItem.update({
      where: { id },
      data: {
        label,
        path,
        role, // ADD THIS
        icon: icon || null,
        section: section || null,
        order: order || null,
        badge: badge || null,
        description: description || null,
        isActive,
        isExternal,
        target: target || null,
        feature: featureId ? { connect: { id: featureId } } : { disconnect: true },
        plans: { set: planIds.map((id: number) => ({ id })) },
      },
      include: { feature: true, plans: true },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update sidebar item" }, { status: 500 });
  }
}
export async function DELETE(req: Request, context: RouteContext) {
  const { id: idStr } = await context.params;
  const id = Number(idStr);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    await prisma.sidebarItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete sidebar item" }, { status: 500 });
  }
}
