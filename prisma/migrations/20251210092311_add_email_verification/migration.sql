/*
  Warnings:

  - You are about to alter the column `leaseStatus` on the `Lease` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `Enum(EnumId(8))`.
  - The `email_verified` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[verificationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `HouseDetail` ADD COLUMN `houseName` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Invite` ADD COLUMN `leaseId` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Lease` ADD COLUMN `autoRenew` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `complianceCheckDate` DATETIME(0) NULL,
    ADD COLUMN `complianceNotes` TEXT NULL,
    ADD COLUMN `complianceStatus` ENUM('PENDING', 'COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW') NULL DEFAULT 'PENDING',
    ADD COLUMN `documentVersion` INTEGER NULL DEFAULT 1,
    ADD COLUMN `escalationFrequency` VARCHAR(20) NULL,
    ADD COLUMN `escalationRate` FLOAT NULL,
    ADD COLUMN `escalationType` ENUM('FIXED', 'PERCENTAGE', 'INDEX', 'MARKET') NULL,
    ADD COLUMN `hasRenewalOption` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `hasRentEscalation` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `lastDocumentUpdate` DATETIME(0) NULL,
    ADD COLUMN `nextEscalationDate` DATETIME(0) NULL,
    ADD COLUMN `renewalNoticeDays` INTEGER NULL,
    ADD COLUMN `renewalRentIncrease` FLOAT NULL,
    ADD COLUMN `renewalTermMonths` INTEGER NULL,
    MODIFY `leaseStatus` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SIGNED', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'TERMINATED', 'RENEWED') NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `MaintenanceRequest` ADD COLUMN `assigned_at` DATETIME(0) NULL,
    ADD COLUMN `assigned_vendor_id` VARCHAR(191) NULL,
    ADD COLUMN `cost` DECIMAL(10, 2) NULL,
    MODIFY `status` ENUM('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE `Unit` ADD COLUMN `currency` VARCHAR(10) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `verificationToken` VARCHAR(191) NULL,
    DROP COLUMN `email_verified`,
    ADD COLUMN `email_verified` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `invoice` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `lease_id` VARCHAR(191) NOT NULL,
    `type` ENUM('RENT', 'UTILITY') NOT NULL,
    `amount` FLOAT NOT NULL,
    `dueDate` DATETIME(0) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'OVERDUE') NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `lease_id`(`lease_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lease_utility` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `lease_id` VARCHAR(191) NOT NULL,
    `utility_id` CHAR(36) NOT NULL,
    `is_tenant_responsible` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `lease_id`(`lease_id`),
    INDEX `utility_id`(`utility_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `invoice_id` CHAR(36) NOT NULL,
    `amount` FLOAT NOT NULL,
    `method` ENUM('CASH', 'BANK', 'CREDIT CARD') NOT NULL,
    `reference` VARCHAR(100) NULL,
    `paidOn` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_reversed` BOOLEAN NOT NULL DEFAULT false,
    `reversed_at` DATETIME(0) NULL,
    `reversal_reason` VARCHAR(255) NULL,
    `reversed_by` VARCHAR(100) NULL,

    INDEX `invoice_id`(`invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receipt` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `invoice_id` CHAR(36) NOT NULL,
    `payment_id` CHAR(36) NOT NULL,
    `receiptNo` VARCHAR(100) NOT NULL,
    `issuedOn` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `receiptNo`(`receiptNo`),
    INDEX `invoice_id`(`invoice_id`),
    INDEX `payment_id`(`payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utility` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('FIXED', 'METERED') NOT NULL,
    `unitPrice` FLOAT NULL,
    `fixedAmount` FLOAT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utility_reading` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `lease_utility_id` CHAR(36) NOT NULL,
    `reading_value` FLOAT NOT NULL,
    `readingDate` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `amount` FLOAT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `lease_utility_id`(`lease_utility_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceItem` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `invoiceId` CHAR(36) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `invoiceId`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OccupancyHistory` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `occupancyRate` DECIMAL(5, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_occupancy_property_year_month`(`propertyId`, `year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_reversal` (
    `id` CHAR(36) NOT NULL,
    `payment_id` CHAR(36) NOT NULL,
    `invoice_id` CHAR(36) NOT NULL,
    `amount` FLOAT NOT NULL,
    `reason` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `reversed_by` VARCHAR(100) NULL,
    `metadata` JSON NULL,

    INDEX `idx_payment_id`(`payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaseAmendment` (
    `id` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `amendmentType` ENUM('RENT_CHANGE', 'TERM_EXTENSION', 'UTILITY_CHANGE', 'RESPONSIBILITY_CHANGE', 'TENANT_CHANGE', 'OTHER') NOT NULL,
    `effectiveDate` DATETIME(0) NOT NULL,
    `description` TEXT NULL,
    `changes` JSON NULL,
    `previousValues` JSON NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED') NULL DEFAULT 'PENDING',
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(0) NULL,
    `executedBy` VARCHAR(191) NULL,
    `executedAt` DATETIME(0) NULL,
    `documentUrl` TEXT NULL,

    INDEX `idx_leaseAmendment_leaseId`(`leaseId`),
    INDEX `idx_leaseAmendment_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaseAuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `action` TEXT NOT NULL,
    `performedBy` VARCHAR(191) NOT NULL,
    `performedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `changes` JSON NULL,
    `ipAddress` VARCHAR(50) NULL,
    `userAgent` TEXT NULL,

    INDEX `idx_leaseAuditLog_leaseId`(`leaseId`),
    INDEX `idx_leaseAuditLog_performedAt`(`performedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaseDocument` (
    `id` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `documentType` ENUM('LEASE_AGREEMENT', 'ADDENDUM', 'AMENDMENT', 'RENEWAL_NOTICE', 'TERMINATION_NOTICE', 'INSPECTION_REPORT', 'PROOF_OF_INSURANCE', 'OTHER') NOT NULL,
    `fileName` TEXT NOT NULL,
    `fileUrl` TEXT NOT NULL,
    `fileSize` INTEGER NULL,
    `mimeType` TEXT NULL,
    `version` INTEGER NULL DEFAULT 1,
    `uploadedBy` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `isSigned` BOOLEAN NULL DEFAULT false,
    `signedAt` DATETIME(0) NULL,
    `description` TEXT NULL,

    INDEX `idx_leaseDocument_documentType`(`documentType`),
    INDEX `idx_leaseDocument_leaseId`(`leaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaseNotification` (
    `id` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `notificationType` ENUM('RENEWAL_REMINDER', 'EXPIRY_WARNING', 'RENT_DUE', 'LATE_PAYMENT', 'ESCALATION_NOTICE', 'COMPLIANCE_CHECK', 'DOCUMENT_REQUIRED', 'MAINTENANCE_SCHEDULED', 'LEASE_SIGNED', 'CUSTOM', 'AMENDMENT_PROPOSED', 'AMENDMENT_EXECUTED') NOT NULL,
    `recipientEmail` VARCHAR(191) NOT NULL,
    `recipientRole` VARCHAR(20) NULL,
    `subject` TEXT NULL,
    `message` TEXT NULL,
    `scheduledFor` DATETIME(0) NOT NULL,
    `sentAt` DATETIME(0) NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED', 'CANCELLED') NULL DEFAULT 'PENDING',
    `metadata` JSON NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_leaseNotification_leaseId`(`leaseId`),
    INDEX `idx_leaseNotification_scheduledFor`(`scheduledFor`),
    INDEX `idx_leaseNotification_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaseRenewal` (
    `id` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `renewalType` ENUM('AUTO', 'MANUAL', 'RENEGOTIATED') NOT NULL,
    `oldEndDate` DATETIME(0) NOT NULL,
    `newEndDate` DATETIME(0) NOT NULL,
    `oldRentAmount` FLOAT NOT NULL,
    `newRentAmount` FLOAT NOT NULL,
    `notificationSentAt` DATETIME(0) NULL,
    `tenantResponseAt` DATETIME(0) NULL,
    `tenantResponse` ENUM('ACCEPT', 'DECLINE', 'NEGOTIATE', 'NO_RESPONSE') NULL,
    `negotiationNotes` TEXT NULL,
    `executedAt` DATETIME(0) NULL,
    `executedBy` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'NOTICE_SENT', 'TENANT_RESPONDED', 'NEGOTIATING', 'APPROVED', 'EXECUTED', 'DECLINED') NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_leaseRenewal_leaseId`(`leaseId`),
    INDEX `idx_leaseRenewal_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RentEscalation` (
    `id` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `effectiveDate` DATETIME(0) NOT NULL,
    `previousRent` FLOAT NOT NULL,
    `newRent` FLOAT NOT NULL,
    `escalationType` ENUM('FIXED', 'PERCENTAGE', 'INDEX', 'MARKET') NOT NULL,
    `escalationRate` FLOAT NULL,
    `calculationNote` TEXT NULL,
    `appliedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `appliedBy` VARCHAR(191) NOT NULL,

    INDEX `idx_rentEscalation_effectiveDate`(`effectiveDate`),
    INDEX `idx_rentEscalation_leaseId`(`leaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    INDEX `PasswordResetToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `idx_invite_leaseId` ON `Invite`(`leaseId`);

-- CreateIndex
CREATE INDEX `idx_lease_endDate` ON `Lease`(`endDate`);

-- CreateIndex
CREATE INDEX `idx_lease_leaseStatus` ON `Lease`(`leaseStatus`);

-- CreateIndex
CREATE INDEX `MaintenanceRequest_assignedVendorId_fkey` ON `MaintenanceRequest`(`assigned_vendor_id`);

-- CreateIndex
CREATE UNIQUE INDEX `users_verificationToken_key` ON `users`(`verificationToken`);

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `fk_MaintenanceRequest_assignedVendorId` FOREIGN KEY (`assigned_vendor_id`) REFERENCES `vendors`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Invite` ADD CONSTRAINT `FK_Invite_Lease` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`lease_id`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lease_utility` ADD CONSTRAINT `lease_utility_ibfk_1` FOREIGN KEY (`lease_id`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lease_utility` ADD CONSTRAINT `lease_utility_ibfk_2` FOREIGN KEY (`utility_id`) REFERENCES `utility`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `receipt` ADD CONSTRAINT `receipt_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `receipt` ADD CONSTRAINT `receipt_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `payment`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `utility_reading` ADD CONSTRAINT `utility_reading_ibfk_1` FOREIGN KEY (`lease_utility_id`) REFERENCES `lease_utility`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_ibfk_1` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `OccupancyHistory` ADD CONSTRAINT `fk_occupancy_property` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payment_reversal` ADD CONSTRAINT `fk_reversal_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `LeaseAmendment` ADD CONSTRAINT `LeaseAmendment_ibfk_1` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `LeaseAuditLog` ADD CONSTRAINT `LeaseAuditLog_ibfk_1` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `LeaseDocument` ADD CONSTRAINT `LeaseDocument_ibfk_1` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `LeaseNotification` ADD CONSTRAINT `LeaseNotification_ibfk_1` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `LeaseRenewal` ADD CONSTRAINT `LeaseRenewal_ibfk_1` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `RentEscalation` ADD CONSTRAINT `RentEscalation_ibfk_1` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
