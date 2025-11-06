-- DropForeignKey
ALTER TABLE `Unit` DROP FOREIGN KEY `Unit_complexDetailId_fkey`;

-- DropIndex
DROP INDEX `Unit_complexDetailId_fkey` ON `Unit`;

-- AlterTable
ALTER TABLE `Unit` ADD COLUMN `houseDetailId` VARCHAR(191) NULL,
    MODIFY `complexDetailId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_complexDetailId_fkey` FOREIGN KEY (`complexDetailId`) REFERENCES `ApartmentComplexDetail`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_houseDetailId_fkey` FOREIGN KEY (`houseDetailId`) REFERENCES `HouseDetail`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
