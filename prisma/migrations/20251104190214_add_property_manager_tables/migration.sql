-- CreateTable
CREATE TABLE `ApartmentComplexDetail` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `buildingName` VARCHAR(191) NULL,
    `totalFloors` INTEGER NULL,
    `totalUnits` INTEGER NULL,

    UNIQUE INDEX `ApartmentComplexDetail_propertyId_key`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HouseDetail` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `numberOfFloors` INTEGER NULL,

    UNIQUE INDEX `HouseDetail_propertyId_key`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ApartmentComplexDetail` ADD CONSTRAINT `ApartmentComplexDetail_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HouseDetail` ADD CONSTRAINT `HouseDetail_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
