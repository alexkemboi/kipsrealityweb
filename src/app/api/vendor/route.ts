import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
   
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const organizationId = searchParams.get("organizationId");

  if (!userId || !organizationId) {
    return NextResponse.json({ error: "Missing userId or organizationId" }, { status: 400 });
  }

  try {
    const vendor = await prisma.vendor.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(vendor);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
