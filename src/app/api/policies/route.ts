import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const policies = await prisma.policy.findMany({
      include: { Section: true },
    });
    return NextResponse.json(policies);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, companyName, contactEmail, privacyEmail, website, mailingAddress, responseTime, inactiveAccountThreshold } = body;

    // Validate required fields
    if (!title || !companyName || !contactEmail || !privacyEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newPolicy = await prisma.policy.create({
      data: {
        title,
        companyName,
        contactEmail,
        privacyEmail,
        website,
        mailingAddress,
        responseTime,
        inactiveAccountThreshold,
        updatedAt: new Date(),

       
      },
    });

    return NextResponse.json(newPolicy, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create policy" }, { status: 500 });
  }
}
