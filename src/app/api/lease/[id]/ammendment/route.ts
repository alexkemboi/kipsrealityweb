import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { LeaseNotification_notificationType } from "@prisma/client";
import crypto from "crypto";

function capturePreviousValues(lease: any, amendmentType: string, changes: any) {
  const previous: any = {};
  switch (amendmentType) {
    case "RENT_CHANGE":
      previous.rentAmount = lease.rentAmount;
      previous.paymentDueDay = lease.paymentDueDay;
      break;
    case "TERM_EXTENSION":
      previous.endDate = lease.endDate;
      previous.leaseTerm = lease.leaseTerm;
      break;
    case "UTILITY_CHANGE":
      previous.tenantPaysElectric = lease.tenantPaysElectric;
      previous.tenantPaysWater = lease.tenantPaysWater;
      previous.tenantPaysTrash = lease.tenantPaysTrash;
      previous.tenantPaysInternet = lease.tenantPaysInternet;
      break;
    case "RESPONSIBILITY_CHANGE":
      previous.tenantResponsibilities = lease.tenantResponsibilities;
      previous.landlordResponsibilities = lease.landlordResponsibilities;
      break;
    case "TENANT_CHANGE":
      previous.tenantId = lease.tenantId;
      break;
    case "DEPOSIT_CHANGE":
      previous.securityDeposit = lease.securityDeposit;
      break;
    case "FEE_STRUCTURE_CHANGE":
      previous.lateFeeFlat = lease.lateFeeFlat;
      previous.lateFeeDaily = lease.lateFeeDaily;
      previous.gracePeriodDays = lease.gracePeriodDays;
      break;
    default:
      Object.keys(changes).forEach((key) => {
        if (key in lease) previous[key] = lease[key];
      });
  }
  return previous;
}

// POST: Create a new amendment
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: leaseId } = await params;
    const body = await req.json();
    const { amendmentType, effectiveDate, description, changes, requiresSignature = true } = body;

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true, tenant: true },
    });

    if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    if (lease.property.managerId !== user.organizationUserId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const previousValues = capturePreviousValues(lease, amendmentType, changes);

    const amendment = await prisma.leaseAmendment.create({
      data: {
        id: crypto.randomUUID(),
        leaseId,
        amendmentType,
        effectiveDate: new Date(effectiveDate),
        description,
        changes,
        previousValues,
        createdBy: user.id,
        status: "PENDING",
      },
    });

    // Send notification to tenant if email exists
    if (lease.tenant?.email) {
      await prisma.leaseNotification.create({
        data: {
          id: crypto.randomUUID(),
          leaseId,
          notificationType: LeaseNotification_notificationType.AMENDMENT_PROPOSED,
          recipientEmail: lease.tenant.email,
          recipientRole: "TENANT",
          subject: "Lease Amendment Proposed",
          message: `A lease amendment has been proposed: ${description}. Please review and respond.`,
          scheduledFor: new Date(),
          status: "PENDING",
        },
      });
    }

    if (requiresSignature) {
      await prisma.lease.update({
        where: { id: leaseId },
        data: {
          landlordSignedAt: null,
          tenantSignedAt: null,
          leaseStatus: "PENDING_APPROVAL",
          documentVersion: { increment: 1 },
        },
      });
    }

    return NextResponse.json(amendment, { status: 201 });
  } catch (error: any) {
    console.error("Amendment creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Fetch all amendments for a lease
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: leaseId } = await params;

    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const amendments = await prisma.leaseAmendment.findMany({
      where: { leaseId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(amendments);
  } catch (error: any) {
    console.error("Fetch amendments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
