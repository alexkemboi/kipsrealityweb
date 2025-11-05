/*
  Warnings:

  - You are about to drop the column `planId` on the `Feature` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Feature` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Feature` DROP FOREIGN KEY `Feature_planId_fkey`;

-- DropIndex
DROP INDEX `Feature_planId_fkey` ON `Feature`;

-- AlterTable
ALTER TABLE `Feature` DROP COLUMN `planId`,
    ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `icon` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `key` VARCHAR(191) NULL,
    ADD COLUMN `path` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Plan` ADD COLUMN `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `organizations` ADD COLUMN `planId` INTEGER NULL;

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

    PRIMARY KEY (`id`)
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

-- CreateIndex
CREATE UNIQUE INDEX `Feature_key_key` ON `Feature`(`key`);

-- AddForeignKey
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SidebarItem` ADD CONSTRAINT `SidebarItem_featureId_fkey` FOREIGN KEY (`featureId`) REFERENCES `Feature`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SidebarItemPlans` ADD CONSTRAINT `_SidebarItemPlans_A_fkey` FOREIGN KEY (`A`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SidebarItemPlans` ADD CONSTRAINT `_SidebarItemPlans_B_fkey` FOREIGN KEY (`B`) REFERENCES `SidebarItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlanFeatures` ADD CONSTRAINT `_PlanFeatures_A_fkey` FOREIGN KEY (`A`) REFERENCES `Feature`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlanFeatures` ADD CONSTRAINT `_PlanFeatures_B_fkey` FOREIGN KEY (`B`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
