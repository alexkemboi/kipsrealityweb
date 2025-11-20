// src/app/api/lease/[id]/escalate/route.ts
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function applyRentEscalation(req: NextRequest, leaseId: string) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { escalationRate, effectiveDate, escalationType } = body;

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true, tenant: true, application: true },
    });

    if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    if (lease.property.managerId !== user.organizationUserId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Calculate new rent
    let newRent = lease.rentAmount;
    if (escalationType === "PERCENTAGE") newRent = lease.rentAmount * (1 + escalationRate / 100);
    else if (escalationType === "FIXED") newRent = lease.rentAmount + escalationRate;

    // Record escalation
    const escalation = await prisma.rentEscalation.create({
      data: {
        leaseId,
        effectiveDate: new Date(effectiveDate),
        previousRent: lease.rentAmount,
        newRent,
        escalationType,
        escalationRate,
        appliedBy: user.id,
        calculationNote: `${escalationType} escalation of ${escalationRate}${escalationType === "PERCENTAGE" ? "%" : ""}`,
      } as Prisma.RentEscalationUncheckedCreateInput,
    });

    // Update lease
    const updatedLease = await prisma.lease.update({
      where: { id: leaseId },
      data: {
        rentAmount: newRent,
        nextEscalationDate: lease.escalationFrequency
          ? calculateNextEscalation(new Date(effectiveDate), lease.escalationFrequency)
          : null,
      },
    });

    // Send notification
    await prisma.leaseNotification.create({
      data: {
        leaseId,
        notificationType: "ESCALATION_NOTICE",
        recipientEmail: lease.tenant?.email || lease.application?.email || "",
        recipientRole: "TENANT",
        subject: "Rent Escalation Notice",
        message: `Your rent will increase from ${lease.rentAmount} to ${newRent} effective ${effectiveDate}`,
        scheduledFor: new Date(),
        status: "PENDING",
      } as Prisma.LeaseNotificationUncheckedCreateInput,
    });

    // Audit
    await prisma.leaseAuditLog.create({
      data: {
        leaseId,
        action: "RENT_ESCALATED",
        performedBy: user.id,
        changes: {
          escalationId: escalation.id,
          previousRent: escalation.previousRent,
          newRent: escalation.newRent,
          effectiveDate: escalation.effectiveDate,
        } as Prisma.InputJsonValue,
      } as Prisma.LeaseAuditLogUncheckedCreateInput,
    });

    return NextResponse.json({ escalation, updatedLease, message: "Rent escalation applied" });
  } catch (error: any) {
    console.error("Escalation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper
function calculateNextEscalation(startDate: Date, frequency: string): Date | null {
  const next = new Date(startDate);
  if (frequency === "ANNUAL") next.setFullYear(next.getFullYear() + 1);
  else if (frequency === "BIANNUAL") next.setMonth(next.getMonth() + 6);
  return next;
}
