import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function GET() {
    const categories = await prisma.appliance.findMany();
    return NextResponse.json(categories);
    
}