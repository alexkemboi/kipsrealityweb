import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { Prisma } from "@prisma/client";

// Utility: Calculate next escalation date
function calculateNextEscalation(startDate: Date, frequency: string): Date {
  const next = new Date(startDate);
  if (frequency === "ANNUAL") {
    next.setFullYear(next.getFullYear() + 1);
  } else if (frequency === "BIANNUAL") {
    next.setMonth(next.getMonth() + 6);
  }
  return next;
}

// POST: Approve lease and transition to APPROVED/ACTIVE/TERMINATED
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leaseId, action } = await req.json();

    if (!leaseId || !action) {
      return NextResponse.json(
        { error: "Missing leaseId or action" },
        { status: 400 }
      );
    }

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true, tenant: true, application: true },
    });

    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    // Authorization check
    if (lease.property.managerId !== user.organizationUserId) {
      return NextResponse.json(
        { error: "Not authorized to modify this lease" },
        { status: 403 }
      );
    }

    let updatedLease;
    let auditAction = "";

    switch (action) {
      case "APPROVE":
        updatedLease = await prisma.lease.update({
          where: { id: leaseId },
          data: { leaseStatus: "APPROVED" },
        });
        auditAction = "APPROVED";
        break;

      case "ACTIVATE":
        if (!lease.landlordSignedAt || !lease.tenantSignedAt) {
          return NextResponse.json(
            { error: "Lease must be signed by both parties before activation" },
            { status: 400 }
          );
        }
        updatedLease = await prisma.lease.update({
          where: { id: leaseId },
          data: { leaseStatus: "ACTIVE" },
        });
        auditAction = "ACTIVATED";
        break;

      case "TERMINATE":
        updatedLease = await prisma.lease.update({
          where: { id: leaseId },
          data: { leaseStatus: "TERMINATED" },
        });
        auditAction = "TERMINATED";
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Create audit log
    await prisma.leaseAuditLog.create({
      data: {
        leaseId,
        action: auditAction,
        performedBy: user.id,
         changes: { status: updatedLease.leaseStatus } as Prisma.InputJsonValue, // ✅ cast as InputJsonValue
  } as Prisma.LeaseAuditLogUncheckedCreateInput, 
});

    return NextResponse.json(updatedLease);
  } catch (error: any) {
    console.error("Workflow error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
