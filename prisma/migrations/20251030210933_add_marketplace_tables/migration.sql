/*
  Warnings:

  - Made the column `city` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bedrooms` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bathrooms` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `size` on table `Property` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Property` DROP FOREIGN KEY `Property_organizationId_fkey`;

-- DropIndex
DROP INDEX `Property_organizationId_fkey` ON `Property`;

-- AlterTable
ALTER TABLE `Property` MODIFY `organizationId` VARCHAR(191) NULL,
    MODIFY `city` VARCHAR(191) NOT NULL,
    MODIFY `address` VARCHAR(191) NOT NULL,
    MODIFY `bedrooms` INTEGER NOT NULL,
    MODIFY `bathrooms` INTEGER NOT NULL,
    MODIFY `size` DOUBLE NOT NULL;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
