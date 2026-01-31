// src/app/api/about-sections/[id]/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.aboutUs.update({
    where: { id: Number(id) },
    data: { section: body.section, description: body.description },
  });
  return NextResponse.json(updated);
}
