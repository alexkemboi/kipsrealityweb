-- DropForeignKey
ALTER TABLE `Feature` DROP FOREIGN KEY `Feature_planId_fkey`;

-- AddForeignKey
ALTER TABLE `Feature` ADD CONSTRAINT `Feature_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
