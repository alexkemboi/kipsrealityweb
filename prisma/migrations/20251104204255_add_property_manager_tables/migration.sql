-- DropForeignKey
ALTER TABLE `Property` DROP FOREIGN KEY `Property_listingId_fkey`;

-- AlterTable
ALTER TABLE `Property` MODIFY `listingId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
