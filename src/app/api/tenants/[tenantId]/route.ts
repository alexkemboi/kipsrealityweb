import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, context: { params: Promise<{ tenantId: string }> }) {
  try {
    // await the params
    const { tenantId } = await context.params;

    const { firstName, lastName, email, phone } = await req.json();

    const updatedTenant = await prisma.user.update({
      where: { id: tenantId },
      data: { firstName, lastName, email, phone },
    });

    return NextResponse.json({ success: true, data: updatedTenant });
  } catch (error: any) {
    console.error("Tenant update error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update tenant" },
      { status: 500 }
    );
  }
}
