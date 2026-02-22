-- RentFlow360 payment/region alignment patch (MySQL 8+)
-- Prisma migration-friendly (no stored procedures)
-- Assumes base tables exist:
--   invite, organization_users, sidebar_items, organizations, users, payment
-- Creates/patches: tenant_payment_methods

SET @prev_fk_checks := @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 0) Expand role enums to include AGENT
-- =========================================================
ALTER TABLE `invite`
  MODIFY COLUMN `role`
  ENUM('SYSTEM_ADMIN','PROPERTY_MANAGER','TENANT','AGENT','VENDOR','ALL') NOT NULL;

ALTER TABLE `organization_users`
  MODIFY COLUMN `role`
  ENUM('SYSTEM_ADMIN','PROPERTY_MANAGER','TENANT','AGENT','VENDOR','ALL') NOT NULL;

ALTER TABLE `sidebar_items`
  MODIFY COLUMN `role`
  ENUM('SYSTEM_ADMIN','PROPERTY_MANAGER','TENANT','AGENT','VENDOR','ALL') NOT NULL;

-- =========================================================
-- 1) organizations: region + payout fields
-- =========================================================
ALTER TABLE `organizations`
  MODIFY COLUMN `region` ENUM('USA','KEN','AFRICA','GLOBAL') NULL DEFAULT 'USA';

UPDATE `organizations`
SET `region` = 'AFRICA'
WHERE `region` = 'KEN';

ALTER TABLE `organizations`
  MODIFY COLUMN `region` ENUM('USA','AFRICA','GLOBAL') NULL DEFAULT 'USA';

ALTER TABLE `organizations`
  ADD COLUMN IF NOT EXISTS `paystack_subaccount_code` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `stripe_connect_id` VARCHAR(191) NULL;

-- =========================================================
-- 2) users: email_verified + payment profile + region
-- =========================================================
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `email_verified_tmp` DATETIME(3) NULL;

SET @ev_type := (
  SELECT DATA_TYPE
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email_verified'
  LIMIT 1
);

SET @ev_legacy := IF(@ev_type IN ('tinyint','bit','boolean'), 1, 0);

SET @sql := IF(
  @ev_legacy = 1,
  'UPDATE `users`
   SET `email_verified_tmp` = COALESCE(`email_verified_tmp`, COALESCE(`created_at`, NOW(3)))
   WHERE (
     CASE
       WHEN (SELECT DATA_TYPE
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ''users''
               AND COLUMN_NAME = ''email_verified''
             LIMIT 1) = ''bit''
       THEN CAST(`email_verified` AS UNSIGNED)
       ELSE `email_verified`
     END
   ) = 1',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @ev_legacy = 1,
  'ALTER TABLE `users` DROP COLUMN `email_verified`',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ev_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email_verified'
);

SET @ev_tmp_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email_verified_tmp'
);

SET @sql := IF(
  @ev_exists = 0 AND @ev_tmp_exists = 1,
  'ALTER TABLE `users` CHANGE COLUMN `email_verified_tmp` `email_verified` DATETIME(3) NULL',
  IF(@ev_exists = 1 AND @ev_tmp_exists = 1,
     'ALTER TABLE `users` DROP COLUMN `email_verified_tmp`',
     'SELECT 1')
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ev_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email_verified'
);

SET @sql := IF(
  @ev_exists = 1,
  'ALTER TABLE `users` MODIFY COLUMN `email_verified` DATETIME(3) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE `users`
  MODIFY COLUMN `kyc_status` ENUM('PENDING','VERIFIED','FAILED') NOT NULL DEFAULT 'PENDING';

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `paystack_customer_code` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `plaid_access_token` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `stripe_customer_id` VARCHAR(191) NULL;

ALTER TABLE `users`
  MODIFY COLUMN `region` ENUM('USA','KEN','AFRICA','GLOBAL') NULL DEFAULT 'USA';

UPDATE `users`
SET `region` = 'AFRICA'
WHERE `region` = 'KEN';

ALTER TABLE `users`
  MODIFY COLUMN `region` ENUM('USA','AFRICA','GLOBAL') NULL DEFAULT 'USA';

-- =========================================================
-- 3) tenant_payment_methods: create + patch
-- =========================================================
CREATE TABLE IF NOT EXISTS `tenant_payment_methods` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `plaid_access_token` VARCHAR(191) NULL,
  `plaid_account_id` VARCHAR(191) NULL,
  `stripe_payment_method_id` VARCHAR(191) NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `tenant_payment_methods`
  ADD COLUMN IF NOT EXISTS `plaid_access_token` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `plaid_account_id` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `stripe_payment_method_id` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

ALTER TABLE `tenant_payment_methods`
  MODIFY COLUMN `stripe_payment_method_id` VARCHAR(191) NULL,
  MODIFY COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tenant_payment_methods'
    AND INDEX_NAME = 'tenant_payment_methods_user_id_idx'
);
SET @sql := IF(
  @idx_exists = 0,
  'ALTER TABLE `tenant_payment_methods` ADD INDEX `tenant_payment_methods_user_id_idx` (`user_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tenant_payment_methods'
    AND COLUMN_NAME = 'default_key'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE `tenant_payment_methods` ADD COLUMN `default_key` VARCHAR(191) AS (IF(`is_default`, `user_id`, NULL)) STORED',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tenant_payment_methods'
    AND INDEX_NAME = 'uniq_default_per_user'
);
SET @sql := IF(
  @idx_exists = 0,
  'ALTER TABLE `tenant_payment_methods` ADD UNIQUE INDEX `uniq_default_per_user` (`default_key`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @orphans := (
  SELECT COUNT(*)
  FROM `tenant_payment_methods` t
  LEFT JOIN `users` u ON u.`id` = t.`user_id`
  WHERE u.`id` IS NULL
);

SET @fk_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tenant_payment_methods'
    AND CONSTRAINT_NAME = 'tenant_payment_methods_user_id_fkey'
);

SET @sql := IF(
  @fk_exists = 0 AND @orphans = 0,
  'ALTER TABLE `tenant_payment_methods`
     ADD CONSTRAINT `tenant_payment_methods_user_id_fkey`
     FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
     ON DELETE CASCADE ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =========================================================
-- 4) payment table patch (backfill + normalize + tighten)
-- =========================================================
ALTER TABLE `payment`
  ADD COLUMN IF NOT EXISTS `amount_subunits` BIGINT NULL,
  ADD COLUMN IF NOT EXISTS `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS `gateway` VARCHAR(32) NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS `type` VARCHAR(32) NOT NULL DEFAULT 'RENT',
  ADD COLUMN IF NOT EXISTS `metadata` JSON NULL,
  ADD COLUMN IF NOT EXISTS `gateway_reference` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `risk_score` INT NULL;

ALTER TABLE `payment`
  MODIFY COLUMN `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  MODIFY COLUMN `gateway` VARCHAR(32) NOT NULL DEFAULT 'MANUAL',
  MODIFY COLUMN `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  MODIFY COLUMN `type` VARCHAR(32) NOT NULL DEFAULT 'RENT';

UPDATE `payment`
SET `currency` = 'USD'
WHERE `currency` IS NULL OR `currency` = '';

SET @amount_col := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'payment'
    AND COLUMN_NAME = 'amount'
);
SET @sql := IF(
  @amount_col > 0,
  'UPDATE `payment`
   SET `amount_subunits` = COALESCE(`amount_subunits`, ROUND(`amount` * 100))
   WHERE `amount_subunits` IS NULL AND `amount` IS NOT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE `payment`
SET `gateway` = 'STRIPE'
WHERE UPPER(TRIM(`gateway`)) IN ('STRIPE','CARD','CREDIT_CARD');

UPDATE `payment`
SET `gateway` = 'PLAID'
WHERE UPPER(TRIM(`gateway`)) IN ('PLAID','ACH');

UPDATE `payment`
SET `gateway` = 'PAYSTACK'
WHERE UPPER(TRIM(`gateway`)) = 'PAYSTACK';

UPDATE `payment`
SET `gateway` = 'MPESA_DIRECT'
WHERE UPPER(TRIM(`gateway`)) IN ('MPESA','M-PESA','MPESA_DIRECT');

UPDATE `payment`
SET `gateway` = 'MANUAL'
WHERE `gateway` IS NULL
   OR TRIM(`gateway`) = ''
   OR UPPER(TRIM(`gateway`)) IN ('MANUAL','CASH','BANK','CHECK','CHEQUE','OFFLINE')
   OR UPPER(TRIM(`gateway`)) NOT IN ('STRIPE','PLAID','PAYSTACK','MPESA_DIRECT','MANUAL');

UPDATE `payment`
SET `status` = 'SETTLED'
WHERE UPPER(TRIM(`status`)) IN ('PAID','COMPLETED','SUCCESS','SUCCEEDED','SETTLED');

UPDATE `payment`
SET `status` = 'AUTHORIZED'
WHERE UPPER(TRIM(`status`)) IN ('AUTHORIZED','AUTHORISED','AUTH','HOLD');

UPDATE `payment`
SET `status` = 'FAILED'
WHERE UPPER(TRIM(`status`)) IN ('FAILED','FAIL','ERROR','DECLINED','CANCELLED','CANCELED');

UPDATE `payment`
SET `status` = 'DISPUTED'
WHERE UPPER(TRIM(`status`)) IN ('DISPUTED','CHARGEBACK');

UPDATE `payment`
SET `status` = 'REVERSED'
WHERE UPPER(TRIM(`status`)) IN ('REVERSED','REFUNDED','VOIDED','VOID');

UPDATE `payment`
SET `status` = 'PENDING'
WHERE `status` IS NULL
   OR TRIM(`status`) = ''
   OR UPPER(TRIM(`status`)) IN ('PENDING','PROCESSING','INITIATED')
   OR UPPER(TRIM(`status`)) NOT IN ('PENDING','AUTHORIZED','SETTLED','FAILED','DISPUTED','REVERSED');

UPDATE `payment`
SET `type` = 'RENT'
WHERE UPPER(TRIM(`type`)) IN ('RENT','MONTHLY_RENT');

UPDATE `payment`
SET `type` = 'DEPOSIT'
WHERE UPPER(TRIM(`type`)) IN ('DEPOSIT','SECURITY_DEPOSIT');

UPDATE `payment`
SET `type` = 'SAAS_FEE'
WHERE UPPER(TRIM(`type`)) IN ('SAAS_FEE','SUBSCRIPTION','PLATFORM_FEE','SERVICE_FEE');

UPDATE `payment`
SET `type` = 'MAINTENANCE'
WHERE UPPER(TRIM(`type`)) IN ('MAINTENANCE','REPAIR');

UPDATE `payment`
SET `type` = 'RENT'
WHERE `type` IS NULL
   OR TRIM(`type`) = ''
   OR UPPER(TRIM(`type`)) NOT IN ('RENT','DEPOSIT','SAAS_FEE','MAINTENANCE');

ALTER TABLE `payment`
  MODIFY COLUMN `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  MODIFY COLUMN `gateway` ENUM('STRIPE','PLAID','PAYSTACK','MPESA_DIRECT','MANUAL') NOT NULL DEFAULT 'MANUAL',
  MODIFY COLUMN `status` ENUM('PENDING','AUTHORIZED','SETTLED','FAILED','DISPUTED','REVERSED') NOT NULL DEFAULT 'PENDING',
  MODIFY COLUMN `type` ENUM('RENT','DEPOSIT','SAAS_FEE','MAINTENANCE') NOT NULL DEFAULT 'RENT';

SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'payment'
    AND INDEX_NAME = 'payment_gateway_reference_idx'
);
SET @sql := IF(
  @idx_exists = 0,
  'ALTER TABLE `payment` ADD INDEX `payment_gateway_reference_idx` (`gateway_reference`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'payment'
    AND INDEX_NAME = 'payment_status_idx'
);
SET @sql := IF(
  @idx_exists = 0,
  'ALTER TABLE `payment` ADD INDEX `payment_status_idx` (`status`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = @prev_fk_checks;
