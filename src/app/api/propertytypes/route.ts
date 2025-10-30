import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(){
     const propertyTypes = await prisma.propertyType.findMany({
      orderBy: { name: "asc" },
    });

     return NextResponse.json(propertyTypes)
}