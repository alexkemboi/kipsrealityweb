-- AlterTable
ALTER TABLE `NavbarItem` ADD COLUMN `parentId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `NavbarItem_parentId_idx` ON `NavbarItem`(`parentId`);

-- CreateIndex
CREATE INDEX `NavbarItem_order_idx` ON `NavbarItem`(`order`);

-- AddForeignKey
ALTER TABLE `NavbarItem` ADD CONSTRAINT `NavbarItem_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `NavbarItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
