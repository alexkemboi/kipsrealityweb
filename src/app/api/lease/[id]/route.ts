import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";

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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    let user = null;
    try {
      user = await getCurrentUser(req);
    } catch (error) {
      console.log("User not authenticated, continuing without user context");
    }

    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        tenant: true,
        property: true,
        unit: true,
      }
    });

    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    // ✅ FIX: Use organizationUserId instead of user.id
    let userRole: "landlord" | "tenant" | null = null;

    if (user) {
      console.log("Lease manager:", lease.property?.managerId);
      console.log("Logged in orgUser:", user.organizationId);
      console.log("Lease tenant:", lease.tenantId);
      console.log("Logged in userId:", user.id);

      if (lease.property?.managerId === user.organizationUserId) {
        userRole = "landlord";
      } else if (lease.tenantId === user.id) {
        userRole = "tenant";
      }
    }

    return NextResponse.json({ ...lease, userRole });
  } catch (error) {
    console.error("Error fetching lease:", error);
    return NextResponse.json({ error: "Failed to fetch lease" }, { status: 500 });
  }
}
