-- AlterTable
ALTER TABLE `Tenantapplication` ADD COLUMN `unitId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Tenantapplication` ADD CONSTRAINT `Tenantapplication_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
