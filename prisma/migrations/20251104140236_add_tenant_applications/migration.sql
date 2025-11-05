-- AlterTable
ALTER TABLE `Property` ADD COLUMN `name` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Tenantapplication` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `dob` DATETIME(3) NOT NULL,
    `ssn` VARCHAR(191) NULL,
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

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tenantapplication` ADD CONSTRAINT `Tenantapplication_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tenantapplication` ADD CONSTRAINT `Tenantapplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
