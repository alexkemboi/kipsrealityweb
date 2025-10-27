// src/app/api/about-sections/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function GET() {
  const sections = await prisma.aboutUs.findMany();
  return NextResponse.json(sections);
}
