/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `listingTypeId` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the `ListingType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Listing` DROP FOREIGN KEY `Listing_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Listing` DROP FOREIGN KEY `Listing_listingTypeId_fkey`;

-- DropIndex
DROP INDEX `Listing_categoryId_fkey` ON `Listing`;

-- DropIndex
DROP INDEX `Listing_listingTypeId_fkey` ON `Listing`;

-- AlterTable
ALTER TABLE `Listing` DROP COLUMN `categoryId`,
    DROP COLUMN `listingTypeId`;

-- DropTable
DROP TABLE `ListingType`;
