import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET service by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  try {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return NextResponse.json({ message: "Service not found" }, { status: 404 });
    return NextResponse.json(service);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}

// PUT to update service
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  try {
    const body = await req.json();
    const { category_id, name, description, features, impact, icon } = body;

    const updated = await prisma.service.update({
      where: { id },
      data: { category_id, name, description, features, impact, icon },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}

// DELETE a service
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  try {
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Database error", details: err }, { status: 500 });
  }
}
