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

    // ✅ Correct landlord check (OrganizationUser.id)
    if (lease.property.managerId !== user.organizationUserId) {
      return NextResponse.json(
        { error: "Only the landlord can sign this lease" },
        { status: 403 }
      );
    }

    const updated = await prisma.lease.update({
      where: { id: leaseId },
      data: {
        landlordSignedAt: new Date(),
        leaseStatus: lease.tenantSignedAt ? "SIGNED" : "DRAFT"
      },
      include: {
        tenant: true,
        property: true,
        unit: true,
      }
    });

    return NextResponse.json({
      message: "Lease signed by landlord",
      lease: updated
    });

  } catch (error) {
    console.error("Landlord sign error:", error);
    return NextResponse.json({ error: "Failed to sign lease" }, { status: 500 });
  }
}
