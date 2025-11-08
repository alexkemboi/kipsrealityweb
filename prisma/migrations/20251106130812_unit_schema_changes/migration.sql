/*
  Warnings:

  - You are about to drop the column `tenantName` on the `Unit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Unit` DROP COLUMN `tenantName`,
    ADD COLUMN `UnitName` VARCHAR(191) NULL;
