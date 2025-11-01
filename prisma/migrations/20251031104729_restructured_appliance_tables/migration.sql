/*
  Warnings:

  - You are about to drop the column `brand` on the `Appliance` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Appliance` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `Appliance` table. All the data in the column will be lost.
  - You are about to drop the column `listingId` on the `Appliance` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `Appliance` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Appliance` table. All the data in the column will be lost.
  - You are about to drop the column `vendorId` on the `Appliance` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyPeriod` on the `Appliance` table. All the data in the column will be lost.
  - Added the required column `name` to the `Appliance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Appliance` DROP FOREIGN KEY `Appliance_listingId_fkey`;

-- DropForeignKey
ALTER TABLE `Appliance` DROP FOREIGN KEY `Appliance_vendorId_fkey`;

-- DropIndex
DROP INDEX `Appliance_listingId_key` ON `Appliance`;

-- DropIndex
DROP INDEX `Appliance_vendorId_fkey` ON `Appliance`;

-- AlterTable
ALTER TABLE `Appliance` DROP COLUMN `brand`,
    DROP COLUMN `category`,
    DROP COLUMN `condition`,
    DROP COLUMN `listingId`,
    DROP COLUMN `model`,
    DROP COLUMN `price`,
    DROP COLUMN `vendorId`,
    DROP COLUMN `warrantyPeriod`,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `_PropertyAppliances` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PropertyAppliances_AB_unique`(`A`, `B`),
    INDEX `_PropertyAppliances_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PropertyAppliances` ADD CONSTRAINT `_PropertyAppliances_A_fkey` FOREIGN KEY (`A`) REFERENCES `Appliance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PropertyAppliances` ADD CONSTRAINT `_PropertyAppliances_B_fkey` FOREIGN KEY (`B`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
