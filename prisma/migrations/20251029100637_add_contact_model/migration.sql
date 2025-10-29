/*
  Warnings:

  - Added the required column `countryCode` to the `ContactMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `ContactMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ContactMessage` ADD COLUMN `countryCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Testimonial` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
