import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function GET() {
  const sections = await prisma.testimonial.findMany();
  return NextResponse.json(sections);
}
