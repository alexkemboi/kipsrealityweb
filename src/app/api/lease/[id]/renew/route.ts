// src/app/api/lease/[id]/renew/route.ts
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function renewLease(req: NextRequest, leaseId: string) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { newEndDate, newRentAmount, renewalType = "MANUAL", negotiationNotes } = body;

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true, tenant: true, tenantApplication: true },
    });

    if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    if (lease.property.managerId !== user.organizationUserId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Create renewal record
    const renewal = await prisma.leaseRenewal.create({
      data: {
        leaseId,
        renewalType,
        oldEndDate: lease.endDate,
        newEndDate: new Date(newEndDate),
        oldRentAmount: lease.rentAmount,
        newRentAmount: newRentAmount || lease.rentAmount,
        negotiationNotes,
        status: "PENDING",
      } as Prisma.LeaseRenewalUncheckedCreateInput,
    });

    // Send notification
    await prisma.leaseNotification.create({
      data: {
        leaseId,
        notificationType: "RENEWAL_REMINDER",
        recipientEmail: lease.tenant?.email || lease.tenantApplication?.email || "",
        recipientRole: "TENANT",
        subject: "Lease Renewal Offer",
        message: `Your lease is eligible for renewal. New terms: Rent ${newRentAmount}, End Date: ${newEndDate}`,
        scheduledFor: new Date(),
        status: "PENDING",
      } as Prisma.LeaseNotificationUncheckedCreateInput,
    });

    // Audit log
    await prisma.leaseAuditLog.create({
      data: {
        leaseId,
        action: "RENEWAL_INITIATED",
        performedBy: user.id,
        changes: {
          renewalId: renewal.id,
          oldEndDate: renewal.oldEndDate,
          newEndDate: renewal.newEndDate,
          oldRentAmount: renewal.oldRentAmount,
          newRentAmount: renewal.newRentAmount,
          status: renewal.status,
        } as Prisma.InputJsonValue,
      } as Prisma.LeaseAuditLogUncheckedCreateInput,
    });

    return NextResponse.json({ renewal, message: "Renewal initiated" });
  } catch (error: any) {
    console.error("Renewal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
