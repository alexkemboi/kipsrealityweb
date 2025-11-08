import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const lease = await prisma.lease.update({
      where: { id },
      data,
      include: {
        tenant: true,
        property: true,
        unit: true,
        application: true,
      }
    });

    return NextResponse.json(lease);

  } catch (error: any) {
    console.error("Lease update error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Lease not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
