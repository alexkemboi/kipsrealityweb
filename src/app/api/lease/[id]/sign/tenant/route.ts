import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/Getcurrentuser";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leaseId } = await context.params;

    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: true,
        tenant: true,
      }
    });

    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    // ✅ Tenant can only sign THEIR lease
    if (lease.tenantId !== user.id) {
      return NextResponse.json({ error: "You are not assigned to this lease" }, { status: 403 });
    }

    const updated = await prisma.lease.update({
      where: { id: leaseId },
      data: {
        tenantSignedAt: new Date(),
        leaseStatus: lease.landlordSignedAt ? "SIGNED" : "DRAFT"
      },
      include: {
        tenant: true,
        property: true,
        unit: true,
      }
    });

    // Log status
    if (updated.leaseStatus === "SIGNED") {
      console.log("✅ Lease fully executed!");
    } else {
      console.log("📧 Waiting for landlord signature");
    }

    return NextResponse.json({ message: "Lease signed by tenant", lease: updated });
  } catch (error) {
    console.error("Tenant sign error:", error);
    return NextResponse.json({ error: "Failed to sign lease" }, { status: 500 });
  }
}