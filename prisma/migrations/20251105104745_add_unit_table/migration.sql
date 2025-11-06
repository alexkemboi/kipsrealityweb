/*
  Warnings:

  - You are about to drop the column `bathrooms` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `bedrooms` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `HouseDetail` ADD COLUMN `bathrooms` INTEGER NULL,
    ADD COLUMN `bedrooms` INTEGER NULL,
    ADD COLUMN `size` DOUBLE NULL;

-- AlterTable
ALTER TABLE `Listing` ADD COLUMN `propertyId` VARCHAR(191) NULL,
    ADD COLUMN `unitId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Property` DROP COLUMN `bathrooms`,
    DROP COLUMN `bedrooms`,
    DROP COLUMN `size`;

-- CreateTable
CREATE TABLE `Unit` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `complexDetailId` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NULL,
    `unitNumber` VARCHAR(191) NOT NULL,
    `floorNumber` INTEGER NULL,
    `bedrooms` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `isOccupied` BOOLEAN NOT NULL DEFAULT false,
    `rentAmount` DOUBLE NULL,
    `tenantName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Unit_listingId_key`(`listingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_complexDetailId_fkey` FOREIGN KEY (`complexDetailId`) REFERENCES `ApartmentComplexDetail`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
