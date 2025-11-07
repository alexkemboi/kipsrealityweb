/*
  Warnings:

  - You are about to drop the column `UnitName` on the `Unit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Unit` DROP COLUMN `UnitName`,
    ADD COLUMN `unitName` VARCHAR(191) NULL;
