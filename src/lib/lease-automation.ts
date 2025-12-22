// lib/lease-automation.ts
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mail";
import { randomUUID } from "crypto";

interface NotificationConfig {
  renewalNoticeDays: number;
  expiryWarningDays: number;
  escalationNoticeDays: number;
}

const config: NotificationConfig = {
  renewalNoticeDays: 60,
  expiryWarningDays: 30,
  escalationNoticeDays: 30,
};

export async function runLeaseAutomation() {
  console.log("🤖 Starting lease automation...");
  try {
    await checkExpiringLeases();
    await checkRenewalOptions();
    await checkRentEscalations();
    await processScheduledNotifications();
    await checkComplianceDates();
    await updateLeaseStatuses();
    console.log("✅ Lease automation completed");
  } catch (error) {
    console.error("❌ Lease automation error:", error);
  }
}

// ---------------------- Expiring Leases ----------------------
async function checkExpiringLeases() {
  const today = new Date();
  const warningDate = new Date(today);
  warningDate.setDate(today.getDate() + config.expiryWarningDays);

  const expiringLeases = await prisma.lease.findMany({
    where: {
      endDate: { gte: today, lte: warningDate },
      leaseStatus: "ACTIVE",
    },
    include: {
      tenant: true,
      application: true,
      property: { include: { manager: true } },
    },
  });

  for (const lease of expiringLeases) {
    const existingNotification = await prisma.leaseNotification.findFirst({
      where: {
        leaseId: lease.id,
        notificationType: "EXPIRY_WARNING",
        sentAt: { not: null },
      },
    });

    if (!existingNotification) {
      await prisma.leaseNotification.create({
        data: {
          id: randomUUID(),
          leaseId: lease.id,
          notificationType: "EXPIRY_WARNING",
          recipientEmail: lease.tenant?.email || lease.application?.email || "",
          recipientRole: "BOTH",
          subject: "Lease Expiring Soon",
          message: `Your lease at ${lease.property.name || "property"} expires on ${lease.endDate.toLocaleDateString()}. Please contact us regarding renewal.`,
          scheduledFor: new Date(),
          status: "PENDING",
        },
      });

      await prisma.lease.update({
        where: { id: lease.id },
        data: { leaseStatus: "EXPIRING_SOON" },
      });
    }
  }

  console.log(`📅 Checked ${expiringLeases.length} expiring leases`);
}

// ---------------------- Renewal Options ----------------------
async function checkRenewalOptions() {
  const today = new Date();
  const renewalDate = new Date(today);
  renewalDate.setDate(today.getDate() + config.renewalNoticeDays);

  const renewableLeases = await prisma.lease.findMany({
    where: {
      endDate: { gte: today, lte: renewalDate },
      hasRenewalOption: true,
      leaseStatus: { in: ["ACTIVE", "EXPIRING_SOON"] },
    },
    include: {
      tenant: true,
      application: true,
      property: { include: { manager: true } },
    },
  });

  for (const lease of renewableLeases) {
    const existingRenewal = await prisma.leaseRenewal.findFirst({
      where: { leaseId: lease.id, status: { in: ["PENDING", "NOTICE_SENT"] } },
    });

    const recipientEmail = lease.tenant?.email || lease.application?.email || "";

    if (!existingRenewal && lease.autoRenew) {
      const newEndDate = new Date(lease.endDate);
      newEndDate.setMonth(newEndDate.getMonth() + (lease.renewalTermMonths || 12));

      let newRent = lease.rentAmount;
      if (lease.renewalRentIncrease) {
        newRent = lease.rentAmount * (1 + lease.renewalRentIncrease / 100);
      }

      await prisma.leaseRenewal.create({
        data: {
          id: randomUUID(),
          leaseId: lease.id,
          renewalType: "AUTO",
          oldEndDate: lease.endDate,
          newEndDate,
          oldRentAmount: lease.rentAmount,
          newRentAmount: newRent,
          status: "NOTICE_SENT",
        },
      });

      await prisma.leaseNotification.create({
        data: {
          id: randomUUID(),
          leaseId: lease.id,
          notificationType: "RENEWAL_REMINDER",
          recipientEmail,
          recipientRole: "TENANT",
          subject: "Automatic Lease Renewal Notice",
          message: `Your lease will automatically renew on ${lease.endDate.toLocaleDateString()}. New end date: ${newEndDate.toLocaleDateString()}, New rent: ${newRent}`,
          scheduledFor: new Date(),
          status: "PENDING",
        },
      });
    } else if (!existingRenewal) {
      await prisma.leaseNotification.create({
        data: {
          id: randomUUID(),
          leaseId: lease.id,
          notificationType: "RENEWAL_REMINDER",
          recipientEmail,
          recipientRole: "BOTH",
          subject: "Lease Renewal Option Available",
          message: `Your lease renewal option is now available. Current lease ends ${lease.endDate.toLocaleDateString()}.`,
          scheduledFor: new Date(),
          status: "PENDING",
        },
      });
    }
  }

  console.log(`🔄 Processed ${renewableLeases.length} renewable leases`);
}

// ---------------------- Rent Escalations ----------------------
async function checkRentEscalations() {
  const today = new Date();
  const noticeDate = new Date(today);
  noticeDate.setDate(today.getDate() + config.escalationNoticeDays);

  const escalatingLeases = await prisma.lease.findMany({
    where: {
      hasRentEscalation: true,
      nextEscalationDate: { gte: today, lte: noticeDate },
      leaseStatus: "ACTIVE",
    },
    include: { tenant: true, application: true },
  });

  for (const lease of escalatingLeases) {
    let newRent = lease.rentAmount;
    if (lease.escalationType === "PERCENTAGE" && lease.escalationRate) {
      newRent = lease.rentAmount * (1 + lease.escalationRate / 100);
    } else if (lease.escalationType === "FIXED" && lease.escalationRate) {
      newRent = lease.rentAmount + lease.escalationRate;
    }

    await prisma.rentEscalation.create({
      data: {
        id: randomUUID(),
        leaseId: lease.id,
        effectiveDate: lease.nextEscalationDate!,
        previousRent: lease.rentAmount,
        newRent,
        escalationType: lease.escalationType!,
        escalationRate: lease.escalationRate!,
        appliedBy: "SYSTEM",
        calculationNote: "Automatic escalation",
      },
    });

    const recipientEmail = lease.tenant?.email || lease.application?.email || "";

    await prisma.leaseNotification.create({
      data: {
        id: randomUUID(),
        leaseId: lease.id,
        notificationType: "ESCALATION_NOTICE",
        recipientEmail,
        recipientRole: "TENANT",
        subject: "Rent Escalation Notice",
        message: `Your rent will increase from ${lease.rentAmount} to ${newRent} effective ${lease.nextEscalationDate?.toLocaleDateString()}`,
        scheduledFor: new Date(),
        status: "PENDING",
      },
    });
  }

  console.log(`📈 Processed ${escalatingLeases.length} rent escalations`);
}

// ---------------------- Scheduled Notifications ----------------------
async function processScheduledNotifications() {
  const pendingNotifications = await prisma.leaseNotification.findMany({
    where: { status: "PENDING", scheduledFor: { lte: new Date() } },
    include: { Lease: { include: { property: true } } },
  });

  for (const notification of pendingNotifications) {
    try {
      await sendEmail({
        to: notification.recipientEmail || "unknown@example.com", // fallback
        subject: notification.subject || "No Subject",          // fallback
        text: notification.message || "No message available",   // fallback
      });
      await prisma.leaseNotification.update({
        where: { id: notification.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch (error) {
      console.error(`Failed to send notification ${notification.id}:`, error);
      await prisma.leaseNotification.update({
        where: { id: notification.id },
        data: { status: "FAILED" },
      });
    }
  }

  console.log(`📧 Sent ${pendingNotifications.length} notifications`);
}

// ---------------------- Compliance Dates ----------------------
async function checkComplianceDates() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Fetch property manager email via relational join
  const leasesNeedingCompliance = await prisma.lease.findMany({
    where: {
      OR: [
        { complianceCheckDate: null },
        { complianceCheckDate: { lt: thirtyDaysAgo } },
      ],
      leaseStatus: "ACTIVE",
    },
    include: {
      property: {
        include: {
          manager: {       // OrganisationUser
            include: {
              user: true, // join to User table
            },
          },
        },
      },
    },
  });

  for (const lease of leasesNeedingCompliance) {
    const recipientEmail = lease.property.manager?.user?.email || "";

    await prisma.leaseNotification.create({
      data: {
        id: randomUUID(),
        leaseId: lease.id,
        notificationType: "COMPLIANCE_CHECK",
        recipientEmail,
        recipientRole: "LANDLORD",
        subject: "Lease Compliance Check Required",
        message: `Lease ${lease.id} requires compliance review`,
        scheduledFor: new Date(),
        status: "PENDING",
      },
    });
  }

  console.log(`✅ Marked ${leasesNeedingCompliance.length} leases for compliance check`);
}

// ---------------------- Update Lease Statuses ----------------------
async function updateLeaseStatuses() {
  const today = new Date();

  await prisma.lease.updateMany({
    where: { endDate: { lt: today }, leaseStatus: { in: ["ACTIVE", "EXPIRING_SOON"] } },
    data: { leaseStatus: "EXPIRED" },
  });

  await prisma.lease.updateMany({
    where: {
      startDate: { lte: today },
      leaseStatus: "SIGNED",
      landlordSignedAt: { not: null },
      tenantSignedAt: { not: null },
    },
    data: { leaseStatus: "ACTIVE" },
  });

  console.log("📊 Updated lease statuses");
}
