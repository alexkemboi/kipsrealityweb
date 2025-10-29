import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  try {
    const cta = await prisma.cTA.findUnique({ where: { id: Number(params.id) } });
    if (!cta) return NextResponse.json({ error: "CTA not found" }, { status: 404 });
    return NextResponse.json(cta);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch CTA" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { page, title, subtitle, buttonText, buttonUrl, gradient } = await req.json();
    const updatedCTA = await prisma.cTA.update({
      where: { id: Number(params.id) },
      data: { page, title, subtitle, buttonText, buttonUrl, gradient },
    });
    return NextResponse.json(updatedCTA);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update CTA" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await prisma.cTA.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "CTA deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete CTA" }, { status: 500 });
  }
}
