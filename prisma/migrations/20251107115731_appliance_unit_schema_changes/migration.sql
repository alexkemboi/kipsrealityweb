/*
  Warnings:

  - You are about to drop the `_PropertyAppliances` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_PropertyAppliances` DROP FOREIGN KEY `_PropertyAppliances_A_fkey`;

-- DropForeignKey
ALTER TABLE `_PropertyAppliances` DROP FOREIGN KEY `_PropertyAppliances_B_fkey`;

-- DropTable
DROP TABLE `_PropertyAppliances`;

-- CreateTable
CREATE TABLE `_UnitAppliances` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_UnitAppliances_AB_unique`(`A`, `B`),
    INDEX `_UnitAppliances_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_UnitAppliances` ADD CONSTRAINT `_UnitAppliances_A_fkey` FOREIGN KEY (`A`) REFERENCES `Appliance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UnitAppliances` ADD CONSTRAINT `_UnitAppliances_B_fkey` FOREIGN KEY (`B`) REFERENCES `Unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
