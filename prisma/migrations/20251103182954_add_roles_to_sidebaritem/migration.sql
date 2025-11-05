/*
  Warnings:

  - Added the required column `role` to the `SidebarItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SidebarItem` ADD COLUMN `role` ENUM('SYSTEM_ADMIN', 'PROPERTY_MANAGER', 'TENANT', 'VENDOR') NOT NULL;
