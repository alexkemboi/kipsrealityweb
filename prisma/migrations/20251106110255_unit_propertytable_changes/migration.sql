-- DropForeignKey
ALTER TABLE `Unit` DROP FOREIGN KEY `Unit_complexDetailId_fkey`;

-- DropForeignKey
ALTER TABLE `Unit` DROP FOREIGN KEY `Unit_houseDetailId_fkey`;

-- DropIndex
DROP INDEX `Unit_complexDetailId_fkey` ON `Unit`;

-- DropIndex
DROP INDEX `Unit_houseDetailId_fkey` ON `Unit`;
