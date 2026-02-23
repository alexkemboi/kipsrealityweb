// src/app/api/about-sections/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return NextResponse.json({ error: "Invalid section id." }, { status: 400 });
    }

    const body = (await req.json()) as { section?: string; description?: string };

    const section = body.section?.trim();
    const description = body.description?.trim();

    if (!section || !description) {
      return NextResponse.json(
        { error: "Both section and description are required." },
        { status: 400 }
      );
    }

    const updated = await prisma.aboutUs.update({
      where: { id: numericId },
      data: { section, description },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    console.error("[PUT /api/about-sections/[id]]", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to update section." }, { status: 500 });
  }
}
