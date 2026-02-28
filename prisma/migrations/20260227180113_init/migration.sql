-- CreateTable
CREATE TABLE `organizations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `logo_url` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `planId` INTEGER NULL,
    `paystack_subaccount_code` VARCHAR(191) NULL,
    `region` ENUM('USA', 'AFRICA', 'GLOBAL', 'KEN', 'NG', 'SA', 'RW', 'UG', 'TZ') NULL DEFAULT 'AFRICA',
    `stripe_connect_id` VARCHAR(191) NULL,

    UNIQUE INDEX `organizations_slug_key`(`slug`),
    INDEX `organizations_planId_fkey`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NULL,
    `last_name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `avatar_url` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `email_verified` DATETIME(3) NULL,
    `verificationToken` VARCHAR(191) NULL,
    `consent_marketing` BOOLEAN NOT NULL DEFAULT false,
    `consent_notifications` BOOLEAN NOT NULL DEFAULT true,
    `consent_transactional` BOOLEAN NOT NULL DEFAULT true,
    `kyc_status` ENUM('PENDING', 'VERIFIED', 'FAILED', 'REJECTED', 'MANUAL_REVIEW') NOT NULL DEFAULT 'PENDING',
    `paystack_customer_code` VARCHAR(191) NULL,
    `plaid_access_token` VARCHAR(191) NULL,
    `region` ENUM('USA', 'AFRICA', 'GLOBAL', 'KEN', 'NG', 'SA', 'RW', 'UG', 'TZ') NULL DEFAULT 'AFRICA',
    `stripeCustomerId` VARCHAR(191) NULL,
    `phoneVerified` DATETIME(3) NULL,
    `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    UNIQUE INDEX `users_verificationToken_key`(`verificationToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenant_payment_methods` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `plaid_access_token` VARCHAR(191) NULL,
    `plaid_account_id` VARCHAR(191) NULL,
    `stripe_payment_method_id` VARCHAR(191) NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tenant_payment_methods_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization_users` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `role` ENUM('SYSTEM_ADMIN', 'PROPERTY_MANAGER', 'TENANT', 'VENDOR', 'ALL') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `organization_users_organization_id_fkey`(`organization_id`),
    UNIQUE INDEX `organization_users_user_id_organization_id_key`(`user_id`, `organization_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendors` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `company_name` VARCHAR(191) NOT NULL,
    `service_type` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `vendors_user_id_fkey`(`user_id`),
    UNIQUE INDEX `vendors_organization_id_user_id_key`(`organization_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invite` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `role` ENUM('SYSTEM_ADMIN', 'PROPERTY_MANAGER', 'TENANT', 'VENDOR', 'ALL') NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `invitedById` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `accepted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leaseId` VARCHAR(255) NULL,

    UNIQUE INDEX `Invite_token_key`(`token`),
    INDEX `Invite_organizationId_idx`(`organizationId`),
    INDEX `Invite_email_idx`(`email`),
    INDEX `Invite_invitedById_fkey`(`invitedById`),
    INDEX `idx_invite_leaseId`(`leaseId`),
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

-- CreateTable
CREATE TABLE `financial_entities` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tax_id_encrypted` VARCHAR(191) NULL,

    INDEX `financial_entities_organization_id_fkey`(`organization_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gl_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE') NOT NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `gl_accounts_entity_id_code_key`(`entity_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gl_journal_entries` (
    `id` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `transaction_date` DATETIME(3) NOT NULL,
    `posted_at` DATETIME(3) NULL,
    `description` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `maintenanceRequestId` VARCHAR(191) NULL,

    INDEX `gl_journal_entries_transaction_date_idx`(`transaction_date`),
    INDEX `gl_journal_entries_entity_id_fkey`(`entity_id`),
    INDEX `gl_journal_entries_maintenanceRequestId_fkey`(`maintenanceRequestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gl_journal_lines` (
    `id` VARCHAR(191) NOT NULL,
    `journal_entry_id` VARCHAR(191) NOT NULL,
    `account_id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `debit` DECIMAL(20, 4) NOT NULL DEFAULT 0.0000,
    `credit` DECIMAL(20, 4) NOT NULL DEFAULT 0.0000,
    `property_id` VARCHAR(191) NULL,
    `unit_id` VARCHAR(191) NULL,
    `lease_id` VARCHAR(191) NULL,
    `tenant_id` VARCHAR(191) NULL,
    `vendor_id` VARCHAR(191) NULL,

    INDEX `gl_journal_lines_account_id_idx`(`account_id`),
    INDEX `gl_journal_lines_property_id_idx`(`property_id`),
    INDEX `gl_journal_lines_journal_entry_id_fkey`(`journal_entry_id`),
    INDEX `gl_journal_lines_lease_id_fkey`(`lease_id`),
    INDEX `gl_journal_lines_unit_id_fkey`(`unit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gl_financial_snapshots` (
    `id` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `period_start` DATETIME(3) NOT NULL,
    `period_end` DATETIME(3) NOT NULL,
    `account_id` VARCHAR(191) NOT NULL,
    `startBalance` DECIMAL(20, 4) NOT NULL,
    `netChange` DECIMAL(20, 4) NOT NULL,
    `endBalance` DECIMAL(20, 4) NOT NULL,
    `calculated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `gl_financial_snapshots_entity_id_account_id_period_end_key`(`entity_id`, `account_id`, `period_end`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utility_bills` (
    `id` VARCHAR(191) NOT NULL,
    `property_id` VARCHAR(191) NOT NULL,
    `provider_name` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `bill_date` DATETIME(3) NOT NULL,
    `due_date` DATETIME(3) NOT NULL,
    `import_method` ENUM('MANUAL_ENTRY', 'CSV_UPLOAD', 'API_SYNC', 'PDF_OCR', 'IMAGE_SCAN') NOT NULL DEFAULT 'MANUAL_ENTRY',
    `ocr_confidence` DECIMAL(5, 2) NULL,
    `status` ENUM('DRAFT', 'PROCESSING', 'REVIEW_REQUIRED', 'APPROVED', 'POSTED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `journal_entry_id` VARCHAR(191) NULL,
    `blockchain_hash` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `file_url` VARCHAR(191) NULL,
    `split_method` ENUM('EQUAL', 'OCCUPANCY_BASED', 'SQ_FOOTAGE', 'SUB_METERED', 'CUSTOM_RATIO', 'AI_OPTIMIZED', 'FIXED') NOT NULL DEFAULT 'EQUAL',
    `updated_at` DATETIME(3) NOT NULL,
    `consumption` FLOAT NULL,
    `period_end` DATETIME(3) NULL,
    `period_start` DATETIME(3) NULL,
    `rate` FLOAT NULL,
    `utility_id` CHAR(36) NULL,
    `approved_at` DATETIME(3) NULL,
    `approved_by` VARCHAR(191) NULL,
    `raw_ocr_data` JSON NULL,

    UNIQUE INDEX `utility_bills_journal_entry_id_key`(`journal_entry_id`),
    INDEX `utility_bills_property_id_idx`(`property_id`),
    INDEX `utility_bills_utility_id_idx`(`utility_id`),
    INDEX `utility_bills_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utility_allocations` (
    `id` VARCHAR(191) NOT NULL,
    `utility_bill_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `invoice_id` VARCHAR(191) NULL,
    `percentage` DECIMAL(5, 2) NULL,
    `blockchain_hash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paidAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `status` ENUM('PENDING', 'PARTIALLY_PAID', 'PAID', 'DISPUTED', 'VOIDED') NOT NULL DEFAULT 'PENDING',
    `tenant_id` VARCHAR(191) NULL,
    `lease_id` VARCHAR(191) NULL,

    UNIQUE INDEX `utility_allocations_invoice_id_key`(`invoice_id`),
    INDEX `utility_allocations_utility_bill_id_idx`(`utility_bill_id`),
    INDEX `utility_allocations_tenant_id_idx`(`tenant_id`),
    INDEX `utility_allocations_lease_id_idx`(`lease_id`),
    INDEX `utility_allocations_unit_id_fkey`(`unit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utility_payments` (
    `id` VARCHAR(191) NOT NULL,
    `allocation_id` VARCHAR(191) NOT NULL,
    `payer_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `method` ENUM('ACH', 'CARD', 'WALLET', 'CRYPTO', 'BANK_TRANSFER', 'CASH') NOT NULL,
    `reference` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'COMPLETED',
    `reconciliation_status` ENUM('PENDING', 'MATCHED', 'FAILED', 'MANUAL_REVIEW') NOT NULL DEFAULT 'PENDING',
    `blockchain_hash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `utility_payments_allocation_id_idx`(`allocation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utility_disputes` (
    `id` VARCHAR(191) NOT NULL,
    `allocation_id` VARCHAR(191) NOT NULL,
    `raised_by` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `urgency_score` INTEGER NULL DEFAULT 1,
    `status` ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `resolution_notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved_at` DATETIME(3) NULL,

    INDEX `utility_disputes_allocation_id_idx`(`allocation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Property` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NULL,
    `managerId` VARCHAR(191) NULL,
    `organizationId` VARCHAR(191) NULL,
    `propertyTypeId` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `amenities` VARCHAR(191) NULL,
    `isFurnished` BOOLEAN NOT NULL DEFAULT false,
    `availabilityStatus` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,

    UNIQUE INDEX `Property_listingId_key`(`listingId`),
    INDEX `Property_locationId_idx`(`locationId`),
    INDEX `Property_managerId_idx`(`managerId`),
    INDEX `Property_organizationId_idx`(`organizationId`),
    INDEX `Property_propertyTypeId_fkey`(`propertyTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropertyImage` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PropertyImage_propertyId_idx`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApartmentComplexDetail` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `buildingName` VARCHAR(191) NULL,
    `totalFloors` INTEGER NULL,
    `totalUnits` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `bedrooms` INTEGER NULL,
    `size` DOUBLE NULL,
    `unitNumber` VARCHAR(50) NULL,
    `zoning` VARCHAR(191) NULL,

    UNIQUE INDEX `ApartmentComplexDetail_propertyId_key`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HouseDetail` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `numberOfFloors` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `bedrooms` INTEGER NULL,
    `size` DOUBLE NULL,
    `totalUnits` INTEGER NULL,
    `houseName` VARCHAR(255) NULL,
    `zoning` VARCHAR(191) NULL,

    UNIQUE INDEX `HouseDetail_propertyId_key`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CondoDetail` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `buildingName` VARCHAR(191) NULL,
    `floorNumber` INTEGER NULL,
    `unitNumber` VARCHAR(191) NULL,
    `totalFloorsInBuilding` INTEGER NULL,
    `bedrooms` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `size` DOUBLE NULL,
    `hoaFees` DOUBLE NULL,
    `hasBalcony` BOOLEAN NOT NULL DEFAULT false,
    `amenities` JSON NULL,
    `zoning` VARCHAR(191) NULL,

    UNIQUE INDEX `CondoDetail_propertyId_key`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LandDetail` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `lotSize` DOUBLE NULL,
    `zoning` VARCHAR(191) NULL,
    `isSubdivided` BOOLEAN NOT NULL DEFAULT false,
    `hasUtilities` BOOLEAN NOT NULL DEFAULT false,
    `topography` VARCHAR(191) NULL,
    `soilType` VARCHAR(191) NULL,
    `accessRoad` BOOLEAN NOT NULL DEFAULT false,
    `landUse` VARCHAR(191) NULL,

    UNIQUE INDEX `LandDetail_propertyId_key`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TownhouseDetail` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `townhouseName` VARCHAR(191) NULL,
    `numberOfFloors` INTEGER NULL,
    `bedrooms` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `size` DOUBLE NULL,
    `unitNumber` VARCHAR(191) NULL,
    `endUnit` BOOLEAN NOT NULL DEFAULT false,
    `hasGarage` BOOLEAN NOT NULL DEFAULT false,
    `garageSpaces` INTEGER NULL,
    `hasBackyard` BOOLEAN NOT NULL DEFAULT false,
    `backyardSize` DOUBLE NULL,
    `hoaFees` DOUBLE NULL,
    `zoning` VARCHAR(191) NULL,

    UNIQUE INDEX `TownhouseDetail_propertyId_key`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Unit` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `complexDetailId` VARCHAR(191) NULL,
    `listingId` VARCHAR(191) NULL,
    `unitNumber` VARCHAR(191) NOT NULL,
    `floorNumber` INTEGER NULL,
    `bedrooms` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `isOccupied` BOOLEAN NOT NULL DEFAULT false,
    `rentAmount` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `houseDetailId` VARCHAR(191) NULL,
    `unitName` VARCHAR(191) NULL,
    `currency` VARCHAR(10) NULL DEFAULT 'USD',
    `square_footage` DOUBLE NULL,

    UNIQUE INDEX `Unit_listingId_key`(`listingId`),
    INDEX `Unit_propertyId_idx`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appliance` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tenantapplication` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `dob` DATETIME(3) NOT NULL,
    `ssn` VARCHAR(191) NULL,
    `ssn_encrypted` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `employerName` VARCHAR(191) NULL,
    `jobTitle` VARCHAR(191) NULL,
    `monthlyIncome` DOUBLE NULL,
    `employmentDuration` VARCHAR(191) NULL,
    `leaseType` VARCHAR(191) NOT NULL,
    `occupancyType` VARCHAR(191) NOT NULL,
    `moveInDate` DATETIME(3) NOT NULL,
    `leaseDuration` VARCHAR(191) NOT NULL,
    `occupants` INTEGER NULL,
    `pets` VARCHAR(191) NULL,
    `landlordName` VARCHAR(191) NULL,
    `landlordContact` VARCHAR(191) NULL,
    `reasonForMoving` VARCHAR(191) NULL,
    `referenceName` VARCHAR(191) NULL,
    `referenceContact` VARCHAR(191) NULL,
    `consent` BOOLEAN NOT NULL DEFAULT false,
    `propertyId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `unitId` VARCHAR(191) NULL,

    INDEX `Tenantapplication_propertyId_idx`(`propertyId`),
    INDEX `Tenantapplication_userId_idx`(`userId`),
    INDEX `Tenantapplication_unitId_fkey`(`unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lease` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `unitId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `rentAmount` DOUBLE NOT NULL,
    `securityDeposit` DOUBLE NULL,
    `leaseStatus` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SIGNED', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'TERMINATED', 'RENEWED') NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `earlyTerminationFee` DOUBLE NULL,
    `gracePeriodDays` INTEGER NULL,
    `landlordResponsibilities` VARCHAR(191) NULL,
    `landlordSignedAt` DATETIME(3) NULL,
    `lateFeeDaily` DOUBLE NULL,
    `lateFeeFlat` DOUBLE NULL,
    `leaseTerm` VARCHAR(191) NULL,
    `paymentDueDay` INTEGER NULL,
    `paymentFrequency` VARCHAR(191) NOT NULL DEFAULT 'MONTHLY',
    `tenantPaysElectric` BOOLEAN NOT NULL DEFAULT true,
    `tenantPaysInternet` BOOLEAN NOT NULL DEFAULT false,
    `tenantPaysTrash` BOOLEAN NOT NULL DEFAULT false,
    `tenantPaysWater` BOOLEAN NOT NULL DEFAULT false,
    `tenantResponsibilities` VARCHAR(191) NULL,
    `usageType` VARCHAR(191) NULL,
    `hasRenewalOption` BOOLEAN NULL DEFAULT false,
    `renewalNoticeDays` INTEGER NULL,
    `renewalTermMonths` INTEGER NULL,
    `renewalRentIncrease` DOUBLE NULL,
    `autoRenew` BOOLEAN NULL DEFAULT false,
    `hasRentEscalation` BOOLEAN NULL DEFAULT false,
    `escalationType` ENUM('FIXED', 'PERCENTAGE', 'INDEX', 'MARKET') NULL,
    `escalationRate` DOUBLE NULL,
    `escalationFrequency` VARCHAR(20) NULL,
    `nextEscalationDate` DATETIME(0) NULL,
    `documentVersion` INTEGER NULL DEFAULT 1,
    `lastDocumentUpdate` DATETIME(0) NULL,
    `complianceCheckDate` DATETIME(0) NULL,
    `complianceStatus` ENUM('PENDING', 'COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW') NULL DEFAULT 'PENDING',
    `complianceNotes` TEXT NULL,
    `tenantSignedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Lease_applicationId_key`(`applicationId`),
    INDEX `Lease_propertyId_idx`(`propertyId`),
    INDEX `Lease_tenantId_idx`(`tenantId`),
    INDEX `Lease_unitId_idx`(`unitId`),
    INDEX `Lease_endDate_idx`(`endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice` (
    `id` VARCHAR(191) NOT NULL,
    `lease_id` VARCHAR(191) NOT NULL,
    `type` ENUM('RENT', 'UTILITY', 'MAINTENANCE', 'DAMAGE', 'LATE_FEE', 'DEPOSIT') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `amount_paid` DOUBLE NOT NULL DEFAULT 0,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `dueDate` DATETIME(0) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'OVERDUE') NULL DEFAULT 'PENDING',
    `posting_status` ENUM('DRAFT', 'PENDING', 'POSTED', 'FAILED', 'REVERSED') NOT NULL DEFAULT 'PENDING',
    `journal_entry_id` VARCHAR(191) NULL,
    `utility_bill_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `invoice_journal_entry_id_key`(`journal_entry_id`),
    INDEX `invoice_lease_id_fkey`(`lease_id`),
    INDEX `invoice_utility_bill_id_fkey`(`utility_bill_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceItem` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` CHAR(36) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `invoiceId`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` VARCHAR(191) NOT NULL,
    `invoice_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `method` ENUM('CASH', 'CHECK', 'BANK_TRANSFER_MANUAL', 'BANK_TRANSFER_ACH', 'CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_MONEY_MPESA', 'MOBILE_MONEY_AIRTEL', 'MOBILE_MONEY_OTHER', 'USSD', 'DIGITAL_WALLET_APPLE', 'DIGITAL_WALLET_GOOGLE', 'P2P_ZELLE', 'P2P_VENMO', 'CRYPTO', 'PAYPAL', 'STRIPE', 'PAYSTACK', 'MANUAL', 'OTHER') NOT NULL,
    `reference` VARCHAR(100) NULL,
    `posting_status` ENUM('DRAFT', 'PENDING', 'POSTED', 'FAILED', 'REVERSED') NOT NULL DEFAULT 'PENDING',
    `journal_entry_id` VARCHAR(191) NULL,
    `amount_subunits` BIGINT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `type` ENUM('RENT', 'UTILITY', 'MAINTENANCE', 'DEPOSIT', 'OTHER') NOT NULL DEFAULT 'RENT',
    `metadata` JSON NULL,
    `bank_name` VARCHAR(191) NULL,
    `countryCode` CHAR(2) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `exchange_rate` DECIMAL(10, 6) NULL,
    `failure_reason` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `last_4` VARCHAR(191) NULL,
    `next_retry_at` DATETIME(3) NULL,
    `paid_on` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `payment_method_id` VARCHAR(191) NULL,
    `processor` ENUM('MANUAL', 'STRIPE', 'PAYPAL', 'PAYSTACK', 'MPESA', 'PESAPAL', 'FLUTTERWAVE', 'PLAID', 'OTHER') NULL DEFAULT 'MANUAL',
    `processor_id` VARCHAR(191) NULL,
    `processor_status` VARCHAR(191) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `routing_number` VARCHAR(191) NULL,
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `payment_journal_entry_id_key`(`journal_entry_id`),
    UNIQUE INDEX `payment_processor_id_key`(`processor_id`),
    INDEX `payment_status_idx`(`status`),
    INDEX `payment_invoice_id_idx`(`invoice_id`),
    INDEX `payment_method_idx`(`method`),
    INDEX `payment_processor_id_idx`(`processor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_reversal` (
    `id` VARCHAR(191) NOT NULL,
    `payment_id` VARCHAR(191) NOT NULL,
    `invoice_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `reason` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reversed_by` VARCHAR(100) NULL,
    `metadata` JSON NULL,

    INDEX `payment_reversal_payment_id_idx`(`payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receipt` (
    `id` VARCHAR(191) NOT NULL,
    `invoice_id` VARCHAR(191) NOT NULL,
    `payment_id` VARCHAR(191) NOT NULL,
    `receiptNo` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `issued_on` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `receiptNo`(`receiptNo`),
    INDEX `receipt_invoice_id_idx`(`invoice_id`),
    INDEX `receipt_payment_id_idx`(`payment_id`),
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
CREATE TABLE `lease_utility` (
    `id` VARCHAR(191) NOT NULL,
    `lease_id` VARCHAR(191) NOT NULL,
    `utility_id` CHAR(36) NOT NULL,
    `is_tenant_responsible` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `lease_utility_lease_id_idx`(`lease_id`),
    INDEX `lease_utility_utility_id_idx`(`utility_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utility_reading` (
    `id` VARCHAR(191) NOT NULL,
    `lease_utility_id` CHAR(36) NOT NULL,
    `reading_value` FLOAT NOT NULL,
    `readingDate` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `amount` FLOAT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `utility_reading_lease_utility_id_idx`(`lease_utility_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dss_documents` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `lease_id` VARCHAR(191) NULL,
    `property_id` VARCHAR(191) NULL,
    `unit_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `original_file_url` TEXT NULL,
    `original_file_key` VARCHAR(191) NULL,
    `mime_type` VARCHAR(191) NULL,
    `file_size_bytes` INTEGER NULL,
    `original_pdf_sha256_hex` VARCHAR(191) NOT NULL,
    `final_pdf_sha256_hex` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'SENT', 'IN_SIGNING', 'COMPLETED', 'DECLINED', 'VOIDED', 'EXPIRED') NOT NULL DEFAULT 'DRAFT',
    `signingMode` ENUM('SEQUENTIAL', 'PARALLEL') NOT NULL DEFAULT 'SEQUENTIAL',
    `current_step` INTEGER NOT NULL DEFAULT 1,
    `sent_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `voided_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `dss_documents_lease_id_idx`(`lease_id`),
    INDEX `dss_documents_organization_id_idx`(`organization_id`),
    INDEX `dss_documents_property_id_fkey`(`property_id`),
    INDEX `dss_documents_unit_id_fkey`(`unit_id`),
    UNIQUE INDEX `dss_documents_id_organization_id_key`(`id`, `organization_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dss_participants` (
    `id` VARCHAR(191) NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `email` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(191) NULL,
    `role` ENUM('LANDLORD', 'TENANT', 'PROPERTY_MANAGER', 'AGENT', 'VENDOR', 'WITNESS', 'NOTARY', 'CUSTODIAN', 'OTHER') NOT NULL,
    `step_order` INTEGER NOT NULL DEFAULT 1,
    `has_signed` BOOLEAN NOT NULL DEFAULT false,
    `signed_at` DATETIME(3) NULL,
    `viewed_at` DATETIME(3) NULL,
    `access_token_hash` VARCHAR(191) NULL,

    INDEX `dss_participants_organization_id_fkey`(`organization_id`),
    INDEX `dss_participants_user_id_fkey`(`user_id`),
    UNIQUE INDEX `uq_dss_participant_doc_email_role`(`document_id`, `email`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dss_signatures` (
    `id` VARCHAR(191) NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `participant_id` VARCHAR(191) NOT NULL,
    `signature_hash` VARCHAR(191) NOT NULL,
    `signed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `dss_signatures_participant_id_fkey`(`participant_id`),
    UNIQUE INDEX `uq_dss_signature_doc_participant`(`document_id`, `participant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blockchain_notary_records` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `chain_id` INTEGER NOT NULL,
    `contract_address` VARCHAR(191) NOT NULL,
    `notarized_hash` VARCHAR(191) NOT NULL,
    `tx_hash` VARCHAR(191) NULL,
    `block_number` INTEGER NULL,
    `status` ENUM('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `confirmed_at` DATETIME(3) NULL,

    UNIQUE INDEX `uq_notary_document`(`document_id`),
    INDEX `blockchain_notary_records_notarized_hash_idx`(`notarized_hash`),
    INDEX `blockchain_notary_records_organization_id_fkey`(`organization_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blockchain_notary_attempts` (
    `id` VARCHAR(191) NOT NULL,
    `notary_record_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `tx_hash` VARCHAR(191) NULL,
    `block_number` INTEGER NULL,
    `failure_reason` TEXT NULL,
    `request_payload` JSON NULL,
    `response_payload` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `confirmed_at` DATETIME(3) NULL,

    INDEX `notary_attempts_record_created_idx`(`notary_record_id`, `created_at`),
    INDEX `notary_attempts_status_created_idx`(`status`, `created_at`),
    INDEX `notary_attempts_tx_hash_idx`(`tx_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dss_workflow_templates` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `property_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `dss_workflow_templates_organization_id_fkey`(`organization_id`),
    INDEX `dss_workflow_templates_property_id_fkey`(`property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dss_workflow_steps` (
    `id` VARCHAR(191) NOT NULL,
    `template_id` VARCHAR(191) NOT NULL,
    `step_order` INTEGER NOT NULL,
    `role` ENUM('LANDLORD', 'TENANT', 'PROPERTY_MANAGER', 'AGENT', 'VENDOR', 'WITNESS', 'NOTARY', 'CUSTODIAN', 'OTHER') NOT NULL,
    `label` VARCHAR(191) NULL,
    `is_optional` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `dss_workflow_steps_template_id_step_order_key`(`template_id`, `step_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dss_audit_events` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `participant_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `event_type` ENUM('DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_SENT', 'DOCUMENT_VIEWED', 'PARTICIPANT_VIEWED', 'CONSENT_ACCEPTED', 'AUTH_VERIFIED', 'SIGNATURE_APPLIED', 'SIGNATURE_DECLINED', 'REMINDER_SENT', 'STEP_ADVANCED', 'DOCUMENT_COMPLETED', 'DOCUMENT_VOIDED', 'NOTARY_REQUESTED', 'NOTARY_CONFIRMED', 'NOTARY_FAILED') NOT NULL,
    `actor_type` ENUM('SYSTEM', 'ADMIN', 'PARTICIPANT', 'USER') NOT NULL,
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_address` VARCHAR(64) NULL,
    `user_agent` TEXT NULL,
    `metadata` JSON NULL,

    INDEX `dss_audit_events_org_idx`(`organization_id`),
    INDEX `dss_audit_events_doc_time_idx`(`document_id`, `occurred_at`),
    INDEX `dss_audit_events_participant_time_idx`(`participant_id`, `occurred_at`),
    INDEX `dss_audit_events_type_time_idx`(`event_type`, `occurred_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Listing` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `statusId` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `propertyId` VARCHAR(191) NULL,
    `unitId` VARCHAR(191) NULL,

    INDEX `Listing_createdBy_idx`(`createdBy`),
    INDEX `Listing_locationId_idx`(`locationId`),
    INDEX `Listing_organizationId_idx`(`organizationId`),
    INDEX `Listing_statusId_idx`(`statusId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceMarketplace` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `vendorId` VARCHAR(191) NULL,
    `serviceTypeId` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `rate` DECIMAL(10, 2) NOT NULL,
    `availability` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ServiceMarketplace_listingId_key`(`listingId`),
    INDEX `ServiceMarketplace_serviceTypeId_idx`(`serviceTypeId`),
    INDEX `ServiceMarketplace_vendorId_idx`(`vendorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaintenanceRequest` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `requestedById` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `status` ENUM('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `category` ENUM('EMERGENCY', 'URGENT', 'ROUTINE', 'STANDARD') NOT NULL DEFAULT 'STANDARD',
    `unitId` VARCHAR(191) NULL,
    `assigned_vendor_id` VARCHAR(191) NULL,
    `cost` DECIMAL(10, 2) NULL,
    `assigned_at` DATETIME(0) NULL,
    `invoice_id` VARCHAR(191) NULL,
    `journal_entry_id` VARCHAR(191) NULL,

    UNIQUE INDEX `MaintenanceRequest_invoice_id_key`(`invoice_id`),
    UNIQUE INDEX `MaintenanceRequest_journal_entry_id_key`(`journal_entry_id`),
    INDEX `MaintenanceRequest_organizationId_idx`(`organizationId`),
    INDEX `MaintenanceRequest_propertyId_idx`(`propertyId`),
    INDEX `MaintenanceRequest_requestedById_idx`(`requestedById`),
    INDEX `MaintenanceRequest_unitId_idx`(`unitId`),
    INDEX `MaintenanceRequest_assigned_vendor_id_idx`(`assigned_vendor_id`),
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
CREATE TABLE `AdminAction` (
    `id` VARCHAR(191) NOT NULL,
    `adminOrgUserId` VARCHAR(191) NOT NULL,
    `targetOrgUserId` VARCHAR(191) NULL,
    `listingId` VARCHAR(191) NULL,
    `actionTypeId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `details` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AdminAction_actionTypeId_idx`(`actionTypeId`),
    INDEX `AdminAction_adminOrgUserId_idx`(`adminOrgUserId`),
    INDEX `AdminAction_listingId_idx`(`listingId`),
    INDEX `AdminAction_targetOrgUserId_idx`(`targetOrgUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoryMarketplace` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CategoryMarketplace_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActionType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ActionType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListingImage` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ListingImage_listingId_idx`(`listingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListingStatus` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ListingStatus_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ServiceType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `tagline` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `features` JSON NOT NULL,
    `impact` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,

    INDEX `services_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutUs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `section` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Applicant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `resume` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Applicant_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Application` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobId` INTEGER NOT NULL,
    `applicantId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Application_applicantId_idx`(`applicantId`),
    INDEX `Application_jobId_idx`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CTA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NOT NULL,
    `buttonText` VARCHAR(191) NOT NULL,
    `buttonUrl` VARCHAR(191) NOT NULL,
    `gradient` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `countryCode` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HeroSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `subtitle` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `buttonText` VARCHAR(191) NULL,
    `buttonUrl` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `iconUrl` VARCHAR(191) NULL,
    `searchBar` BOOLEAN NOT NULL DEFAULT false,
    `gradient` VARCHAR(191) NULL,
    `layout` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Policy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `privacyEmail` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `mailingAddress` VARCHAR(191) NULL,
    `responseTime` VARCHAR(191) NULL,
    `inactiveAccountThreshold` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Section` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `intro` VARCHAR(191) NULL,
    `content` JSON NULL,
    `order` INTEGER NULL,
    `policyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Section_policyId_idx`(`policyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Testimonial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `badge` VARCHAR(191) NULL,
    `monthlyPrice` DOUBLE NOT NULL,
    `yearlyPrice` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `gradient` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feature` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `icon` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `key` VARCHAR(191) NULL,
    `path` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Feature_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SidebarItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `section` VARCHAR(191) NULL,
    `order` INTEGER NULL,
    `badge` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isExternal` BOOLEAN NOT NULL DEFAULT false,
    `target` VARCHAR(191) NULL,
    `featureId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `role` ENUM('SYSTEM_ADMIN', 'PROPERTY_MANAGER', 'TENANT', 'AGENT', 'VENDOR', 'ALL') NOT NULL,

    INDEX `SidebarItem_featureId_idx`(`featureId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NavbarItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `href` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `parentId` INTEGER NULL,

    INDEX `NavbarItem_parentId_idx`(`parentId`),
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

    INDEX `LeaseAmendment_leaseId_idx`(`leaseId`),
    INDEX `LeaseAmendment_status_idx`(`status`),
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

    INDEX `LeaseAuditLog_leaseId_idx`(`leaseId`),
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

    INDEX `LeaseDocument_documentType_idx`(`documentType`),
    INDEX `LeaseDocument_leaseId_idx`(`leaseId`),
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

    INDEX `LeaseNotification_leaseId_idx`(`leaseId`),
    INDEX `LeaseNotification_status_idx`(`status`),
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

    INDEX `LeaseRenewal_leaseId_idx`(`leaseId`),
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

    INDEX `RentEscalation_leaseId_idx`(`leaseId`),
    INDEX `RentEscalation_effectiveDate_idx`(`effectiveDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropertyType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PropertyType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgentInvite` (
    `id` VARCHAR(191) NOT NULL,
    `inviteTokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `tenantId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AgentInvite_inviteTokenHash_key`(`inviteTokenHash`),
    INDEX `AgentInvite_expiresAt_idx`(`expiresAt`),
    INDEX `AgentInvite_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListingAuditEntry` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `changes` JSON NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unitId` VARCHAR(191) NULL,

    INDEX `ListingAuditEntry_listingId_idx`(`listingId`),
    INDEX `ListingAuditEntry_unitId_fkey`(`unitId`),
    INDEX `ListingAuditEntry_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Otp` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `type` ENUM('TWO_FACTOR', 'VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION') NOT NULL DEFAULT 'TWO_FACTOR',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Otp_phone_idx`(`phone`),
    INDEX `Otp_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UnitAppliances` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_UnitAppliances_AB_unique`(`A`, `B`),
    INDEX `_UnitAppliances_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SidebarItemPlans` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_SidebarItemPlans_AB_unique`(`A`, `B`),
    INDEX `_SidebarItemPlans_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PlanFeatures` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PlanFeatures_AB_unique`(`A`, `B`),
    INDEX `_PlanFeatures_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_payment_methods` ADD CONSTRAINT `tenant_payment_methods_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_users` ADD CONSTRAINT `organization_users_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_users` ADD CONSTRAINT `organization_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendors` ADD CONSTRAINT `vendors_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendors` ADD CONSTRAINT `vendors_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invite` ADD CONSTRAINT `FK_Invite_Lease` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Invite` ADD CONSTRAINT `Invite_invitedById_fkey` FOREIGN KEY (`invitedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invite` ADD CONSTRAINT `Invite_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_entities` ADD CONSTRAINT `financial_entities_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gl_accounts` ADD CONSTRAINT `gl_accounts_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `financial_entities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gl_journal_entries` ADD CONSTRAINT `gl_journal_entries_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `financial_entities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gl_journal_entries` ADD CONSTRAINT `gl_journal_entries_maintenanceRequestId_fkey` FOREIGN KEY (`maintenanceRequestId`) REFERENCES `MaintenanceRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gl_journal_lines` ADD CONSTRAINT `gl_journal_lines_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `gl_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gl_journal_lines` ADD CONSTRAINT `gl_journal_lines_journal_entry_id_fkey` FOREIGN KEY (`journal_entry_id`) REFERENCES `gl_journal_entries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gl_journal_lines` ADD CONSTRAINT `gl_journal_lines_lease_id_fkey` FOREIGN KEY (`lease_id`) REFERENCES `Lease`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gl_journal_lines` ADD CONSTRAINT `gl_journal_lines_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `Property`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gl_journal_lines` ADD CONSTRAINT `gl_journal_lines_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utility_bills` ADD CONSTRAINT `utility_bills_journal_entry_id_fkey` FOREIGN KEY (`journal_entry_id`) REFERENCES `gl_journal_entries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utility_bills` ADD CONSTRAINT `utility_bills_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utility_bills` ADD CONSTRAINT `utility_bills_utility_id_fkey` FOREIGN KEY (`utility_id`) REFERENCES `utility`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utility_allocations` ADD CONSTRAINT `utility_allocations_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utility_allocations` ADD CONSTRAINT `utility_allocations_lease_id_fkey` FOREIGN KEY (`lease_id`) REFERENCES `Lease`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utility_allocations` ADD CONSTRAINT `utility_allocations_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `Unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utility_allocations` ADD CONSTRAINT `utility_allocations_utility_bill_id_fkey` FOREIGN KEY (`utility_bill_id`) REFERENCES `utility_bills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utility_payments` ADD CONSTRAINT `utility_payments_allocation_id_fkey` FOREIGN KEY (`allocation_id`) REFERENCES `utility_allocations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utility_disputes` ADD CONSTRAINT `utility_disputes_allocation_id_fkey` FOREIGN KEY (`allocation_id`) REFERENCES `utility_allocations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `organization_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_propertyTypeId_fkey` FOREIGN KEY (`propertyTypeId`) REFERENCES `PropertyType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertyImage` ADD CONSTRAINT `PropertyImage_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApartmentComplexDetail` ADD CONSTRAINT `ApartmentComplexDetail_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HouseDetail` ADD CONSTRAINT `HouseDetail_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CondoDetail` ADD CONSTRAINT `CondoDetail_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LandDetail` ADD CONSTRAINT `LandDetail_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TownhouseDetail` ADD CONSTRAINT `TownhouseDetail_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tenantapplication` ADD CONSTRAINT `Tenantapplication_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tenantapplication` ADD CONSTRAINT `Tenantapplication_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tenantapplication` ADD CONSTRAINT `Tenantapplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lease` ADD CONSTRAINT `Lease_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Tenantapplication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lease` ADD CONSTRAINT `Lease_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lease` ADD CONSTRAINT `Lease_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lease` ADD CONSTRAINT `Lease_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_journal_entry_id_fkey` FOREIGN KEY (`journal_entry_id`) REFERENCES `gl_journal_entries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_lease_id_fkey` FOREIGN KEY (`lease_id`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_utility_bill_id_fkey` FOREIGN KEY (`utility_bill_id`) REFERENCES `utility_bills`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_ibfk_1` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_journal_entry_id_fkey` FOREIGN KEY (`journal_entry_id`) REFERENCES `gl_journal_entries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_reversal` ADD CONSTRAINT `fk_reversal_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipt` ADD CONSTRAINT `receipt_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipt` ADD CONSTRAINT `receipt_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lease_utility` ADD CONSTRAINT `lease_utility_lease_id_fkey` FOREIGN KEY (`lease_id`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lease_utility` ADD CONSTRAINT `lease_utility_utility_id_fkey` FOREIGN KEY (`utility_id`) REFERENCES `utility`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utility_reading` ADD CONSTRAINT `utility_reading_lease_utility_id_fkey` FOREIGN KEY (`lease_utility_id`) REFERENCES `lease_utility`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_documents` ADD CONSTRAINT `dss_documents_lease_id_fkey` FOREIGN KEY (`lease_id`) REFERENCES `Lease`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_documents` ADD CONSTRAINT `dss_documents_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_documents` ADD CONSTRAINT `dss_documents_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `Property`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_documents` ADD CONSTRAINT `dss_documents_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_participants` ADD CONSTRAINT `dss_participants_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `dss_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_participants` ADD CONSTRAINT `dss_participants_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_participants` ADD CONSTRAINT `dss_participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_signatures` ADD CONSTRAINT `dss_signatures_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `dss_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_signatures` ADD CONSTRAINT `dss_signatures_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `dss_participants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blockchain_notary_records` ADD CONSTRAINT `blockchain_notary_records_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `dss_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blockchain_notary_records` ADD CONSTRAINT `blockchain_notary_records_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blockchain_notary_attempts` ADD CONSTRAINT `blockchain_notary_attempts_notary_record_id_fkey` FOREIGN KEY (`notary_record_id`) REFERENCES `blockchain_notary_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_workflow_templates` ADD CONSTRAINT `dss_workflow_templates_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_workflow_templates` ADD CONSTRAINT `dss_workflow_templates_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `Property`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_workflow_steps` ADD CONSTRAINT `dss_workflow_steps_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `dss_workflow_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_audit_events` ADD CONSTRAINT `dss_audit_events_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `dss_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_audit_events` ADD CONSTRAINT `dss_audit_events_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_audit_events` ADD CONSTRAINT `dss_audit_events_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `dss_participants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dss_audit_events` ADD CONSTRAINT `dss_audit_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `ListingStatus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceMarketplace` ADD CONSTRAINT `ServiceMarketplace_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceMarketplace` ADD CONSTRAINT `ServiceMarketplace_serviceTypeId_fkey` FOREIGN KEY (`serviceTypeId`) REFERENCES `ServiceType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceMarketplace` ADD CONSTRAINT `ServiceMarketplace_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `organization_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `organization_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `fk_MaintenanceRequest_assignedVendorId` FOREIGN KEY (`assigned_vendor_id`) REFERENCES `vendors`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `OccupancyHistory` ADD CONSTRAINT `fk_occupancy_property` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `AdminAction` ADD CONSTRAINT `AdminAction_actionTypeId_fkey` FOREIGN KEY (`actionTypeId`) REFERENCES `ActionType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminAction` ADD CONSTRAINT `AdminAction_adminOrgUserId_fkey` FOREIGN KEY (`adminOrgUserId`) REFERENCES `organization_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminAction` ADD CONSTRAINT `AdminAction_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminAction` ADD CONSTRAINT `AdminAction_targetOrgUserId_fkey` FOREIGN KEY (`targetOrgUserId`) REFERENCES `organization_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingImage` ADD CONSTRAINT `ListingImage_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `Applicant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_policyId_fkey` FOREIGN KEY (`policyId`) REFERENCES `Policy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SidebarItem` ADD CONSTRAINT `SidebarItem_featureId_fkey` FOREIGN KEY (`featureId`) REFERENCES `Feature`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NavbarItem` ADD CONSTRAINT `NavbarItem_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `NavbarItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaseAmendment` ADD CONSTRAINT `LeaseAmendment_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaseAuditLog` ADD CONSTRAINT `LeaseAuditLog_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaseDocument` ADD CONSTRAINT `LeaseDocument_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaseNotification` ADD CONSTRAINT `LeaseNotification_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaseRenewal` ADD CONSTRAINT `LeaseRenewal_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentEscalation` ADD CONSTRAINT `RentEscalation_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgentInvite` ADD CONSTRAINT `AgentInvite_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingAuditEntry` ADD CONSTRAINT `ListingAuditEntry_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingAuditEntry` ADD CONSTRAINT `ListingAuditEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UnitAppliances` ADD CONSTRAINT `_UnitAppliances_A_fkey` FOREIGN KEY (`A`) REFERENCES `Appliance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UnitAppliances` ADD CONSTRAINT `_UnitAppliances_B_fkey` FOREIGN KEY (`B`) REFERENCES `Unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SidebarItemPlans` ADD CONSTRAINT `_SidebarItemPlans_A_fkey` FOREIGN KEY (`A`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SidebarItemPlans` ADD CONSTRAINT `_SidebarItemPlans_B_fkey` FOREIGN KEY (`B`) REFERENCES `SidebarItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlanFeatures` ADD CONSTRAINT `_PlanFeatures_A_fkey` FOREIGN KEY (`A`) REFERENCES `Feature`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlanFeatures` ADD CONSTRAINT `_PlanFeatures_B_fkey` FOREIGN KEY (`B`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
