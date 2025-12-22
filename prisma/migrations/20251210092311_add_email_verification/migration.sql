/*
  The database has 'email_verified' as a Boolean (1/0), but Prisma expects DateTime.
  We are dropping the old column to resolve the type conflict.
  WARNING: This will reset the verification status of existing users.
*/

-- 1. DROP the column from the correct table 'users'
ALTER TABLE `users` DROP COLUMN `email_verified`;

-- 2. CREATE the column fresh (As a DateTime)
ALTER TABLE `users` ADD COLUMN `email_verified` DATETIME(3) NULL;

-- 3. Add the other missing column
ALTER TABLE `users` ADD COLUMN `verificationToken` VARCHAR(191) NULL;

-- 4. Create the Password Reset Table
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    INDEX `PasswordResetToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Add keys (referencing 'users')
CREATE UNIQUE INDEX `users_verificationToken_key` ON `users`(`verificationToken`);

ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;