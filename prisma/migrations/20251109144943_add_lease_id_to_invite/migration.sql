-- AlterTable
ALTER TABLE `Invite` ADD COLUMN `leaseId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Invite` ADD CONSTRAINT `Invite_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
