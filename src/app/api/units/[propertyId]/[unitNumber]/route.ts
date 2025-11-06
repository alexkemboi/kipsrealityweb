import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function PUT(req: Request, { params }: { params: { unitId: string } }) {
  const { unitId } = params;
  const data = await req.json();

  const updatedUnit = await prisma.unit.update({
    where: { id: unitId },
    data,
  });

  return NextResponse.json(updatedUnit);
}