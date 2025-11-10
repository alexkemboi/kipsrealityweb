-- AlterTable
ALTER TABLE `MaintenanceRequest` ADD COLUMN `category` ENUM('EMERGENCY', 'URGENT', 'ROUTINE', 'STANDARD') NOT NULL DEFAULT 'STANDARD',
    ADD COLUMN `unitId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
