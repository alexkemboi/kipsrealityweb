// src/app/api/lease/[id]/ammendment/[ammendmentId]/route.ts
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// PATCH: Update amendment (approve/reject/execute)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; amendmentId: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: leaseId, amendmentId } = await context.params;
    const body = await req.json();
    const { action, notes } = body;

    // Fetch amendment with tenant via leaseId
    const amendment = await prisma.leaseAmendment.findUnique({
      where: { id: amendmentId },
      include: { Lease: { include: { tenant: true } } },
    });

    if (!amendment) return NextResponse.json({ error: "Amendment not found" }, { status: 404 });
    if (amendment.leaseId !== leaseId)
      return NextResponse.json({ error: "Amendment does not belong to this lease" }, { status: 400 });

    let updateData: any = {};
    let auditAction = "";

    switch (action) {
      case "APPROVE":
        updateData = { status: "APPROVED", approvedBy: user.id, approvedAt: new Date() };
        auditAction = "AMENDMENT_APPROVED";
        break;

      case "REJECT":
        updateData = { status: "REJECTED", approvedBy: user.id, approvedAt: new Date() };
        auditAction = "AMENDMENT_REJECTED";
        break;

      case "EXECUTE":
        // Ensure amendment.status is string
        if ((amendment.status ?? "") !== "APPROVED")
          return NextResponse.json({ error: "Amendment must be approved first" }, { status: 400 });

        // Apply changes to lease
        await prisma.lease.update({
          where: { id: leaseId },
          data: {
            ...(amendment.changes as Record<string, any>),
            documentVersion: { increment: 1 },
            lastDocumentUpdate: new Date(),
          },
        });

        updateData = { status: "EXECUTED", executedAt: new Date(), executedBy: user.id };
        auditAction = "AMENDMENT_EXECUTED";

        // Notify tenant if exists
        if (amendment.Lease?.tenant?.email) {
          await prisma.leaseNotification.create({
            data: {
              id: randomUUID(),
              leaseId,
              notificationType: "CUSTOM",
              recipientEmail: amendment.Lease.tenant.email ?? "unknown@example.com",
              recipientRole: "TENANT",
              subject: "Lease Amendment Executed",
              message: `The lease amendment "${amendment.description ?? ""}" has been executed.`,
              scheduledFor: new Date(),
              status: "PENDING",
            },
          });
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update amendment
    const updated = await prisma.leaseAmendment.update({ where: { id: amendmentId }, data: updateData });

    // Create audit log
    await prisma.leaseAuditLog.create({
      data: {
        id: randomUUID(),
        leaseId,
        action: auditAction,
        performedBy: user.id,
        changes: {
          amendmentId,
          action,
          notes,
          changes: amendment.changes ?? {},
        } as any,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Amendment update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; amendmentId: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: leaseId, amendmentId } = await context.params;

    const amendment = await prisma.leaseAmendment.findUnique({
      where: { id: amendmentId },
      include: { Lease: { include: { tenant: true } } },
    });

    if (!amendment) return NextResponse.json({ error: "Amendment not found" }, { status: 404 });

    if (!["PENDING", "REJECTED"].includes(amendment.status ?? ""))
      return NextResponse.json({ error: "Cannot delete approved/executed amendments" }, { status: 400 });

    await prisma.leaseAmendment.delete({ where: { id: amendmentId } });

    // Audit log
    await prisma.leaseAuditLog.create({
      data: {
        id: randomUUID(),
        leaseId,
        action: "AMENDMENT_DELETED",
        performedBy: user.id,
        changes: { amendmentId, description: amendment.description ?? "" } as any,
      },
    });

    // Notify tenant
    if (amendment.Lease?.tenant?.email) {
      await prisma.leaseNotification.create({
        data: {
          id: randomUUID(),
          leaseId,
          notificationType: "CUSTOM",
          recipientEmail: amendment.Lease.tenant.email,
          recipientRole: "TENANT",
          subject: "Lease Amendment Cancelled",
          message: `The lease amendment "${amendment.description ?? ""}" has been cancelled.`,
          scheduledFor: new Date(),
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({ message: "Amendment deleted" });
  } catch (error: any) {
    console.error("Amendment deletion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
