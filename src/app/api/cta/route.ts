import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const ctas = await prisma.cTA.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(ctas);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch CTAs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { page, title, subtitle, buttonText, buttonUrl, gradient } = await req.json();

    const newCTA = await prisma.cTA.create({
      data: { page, title, subtitle, buttonText, buttonUrl, gradient },
    });

    return NextResponse.json(newCTA, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create CTA" }, { status: 500 });
  }
}
