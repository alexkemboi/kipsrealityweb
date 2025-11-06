-- DropForeignKey
ALTER TABLE `Lease` DROP FOREIGN KEY `Lease_tenantId_fkey`;

-- DropIndex
DROP INDEX `Lease_tenantId_fkey` ON `Lease`;

-- AlterTable
ALTER TABLE `Lease` MODIFY `tenantId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Lease` ADD CONSTRAINT `Lease_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
