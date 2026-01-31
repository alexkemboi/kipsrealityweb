import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.testimonial.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      role: body.role,
      image: body.image,
      text: body.text,
    },
  });
  return NextResponse.json(updated);
}
