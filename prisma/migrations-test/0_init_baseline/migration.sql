-- RentFlow360 payment/region alignment patch (MySQL 8+)
-- Scope:
--   1) Add AGENT to role enums (Invite / organization_users / SidebarItem)
--   2) Add payment settlement columns to organizations (region default USA, stripe/paystack IDs)
--   3) Upgrade users payment profile fields + convert users.email_verified BOOLEAN -> DATETIME(3)
--   4) Create/patch tenant_payment_methods
--   5) Patch payment table defaults/columns if it already exists (currency => USD, gateway/status/type)
--
-- Notes:
-- - Safe to run once on an older schema baseline.
-- - If some objects already exist, it skips or modifies only what is needed.
-- - DDL auto-commits in MySQL.

DELIMITER $$

DROP PROCEDURE IF EXISTS rf360_patch_payment_infra_usa_usd $$
CREATE PROCEDURE rf360_patch_payment_infra_usa_usd()
BEGIN
  DECLARE v_exists INT DEFAULT 0;
  DECLARE v_type VARCHAR(64);

  /* =========================================================
     0) Expand enum columns to include AGENT where missing
     ========================================================= */

  -- Invite.role
  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Invite'
    AND COLUMN_NAME = 'role';
  IF v_exists > 0 THEN
    ALTER TABLE `Invite`
      MODIFY COLUMN `role`
      ENUM('SYSTEM_ADMIN','PROPERTY_MANAGER','TENANT','AGENT','VENDOR','ALL') NOT NULL;
  END IF;

  -- organization_users.role
  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'organization_users'
    AND COLUMN_NAME = 'role';
  IF v_exists > 0 THEN
    ALTER TABLE `organization_users`
      MODIFY COLUMN `role`
      ENUM('SYSTEM_ADMIN','PROPERTY_MANAGER','TENANT','AGENT','VENDOR','ALL') NOT NULL;
  END IF;

  -- SidebarItem.role
  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'SidebarItem'
    AND COLUMN_NAME = 'role';
  IF v_exists > 0 THEN
    ALTER TABLE `SidebarItem`
      MODIFY COLUMN `role`
      ENUM('SYSTEM_ADMIN','PROPERTY_MANAGER','TENANT','AGENT','VENDOR','ALL') NOT NULL;
  END IF;

  /* =========================================================
     1) organizations: add/align payment settlement columns
     ========================================================= */

  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'organizations';

  IF v_exists > 0 THEN
    -- region (default USA)
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'organizations'
      AND COLUMN_NAME = 'region';

    IF v_exists = 0 THEN
      ALTER TABLE `organizations`
        ADD COLUMN `region` ENUM('USA','KEN') NULL DEFAULT 'USA' AFTER `planId`;
    ELSE
      ALTER TABLE `organizations`
        MODIFY COLUMN `region` ENUM('USA','KEN') NULL DEFAULT 'USA';
    END IF;

    -- paystack_subaccount_code
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'organizations'
      AND COLUMN_NAME = 'paystack_subaccount_code';

    IF v_exists = 0 THEN
      ALTER TABLE `organizations`
        ADD COLUMN `paystack_subaccount_code` VARCHAR(191) NULL AFTER `region`;
    END IF;

    -- stripe_connect_id
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'organizations'
      AND COLUMN_NAME = 'stripe_connect_id';

    IF v_exists = 0 THEN
      ALTER TABLE `organizations`
        ADD COLUMN `stripe_connect_id` VARCHAR(191) NULL AFTER `paystack_subaccount_code`;
    END IF;
  END IF;

  /* =========================================================
     2) users: convert email_verified + add payment profile fields
     ========================================================= */

  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users';

  IF v_exists > 0 THEN
    -- Convert users.email_verified BOOLEAN -> DATETIME(3) NULL (Prisma expects DateTime?)
    SELECT DATA_TYPE INTO v_type
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'email_verified'
    LIMIT 1;

    IF v_type IS NOT NULL THEN
      IF v_type IN ('tinyint','bit','boolean') THEN
        -- temp column
        SELECT COUNT(*) INTO v_exists
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
          AND COLUMN_NAME = 'email_verified_tmp';

        IF v_exists = 0 THEN
          ALTER TABLE `users`
            ADD COLUMN `email_verified_tmp` DATETIME(3) NULL AFTER `password_hash`;
        END IF;

        -- backfill "true" users using created_at (adjust if you prefer NOW(3))
        UPDATE `users`
        SET `email_verified_tmp` = `created_at`
        WHERE `email_verified` = 1
          AND `email_verified_tmp` IS NULL;

        ALTER TABLE `users`
          DROP COLUMN `email_verified`;

        ALTER TABLE `users`
          CHANGE COLUMN `email_verified_tmp` `email_verified` DATETIME(3) NULL;
      ELSEIF v_type = 'datetime' THEN
        -- Ensure nullable DATETIME(3)
        ALTER TABLE `users`
          MODIFY COLUMN `email_verified` DATETIME(3) NULL;
      END IF;
    ELSE
      -- If missing entirely, add it
      ALTER TABLE `users`
        ADD COLUMN `email_verified` DATETIME(3) NULL AFTER `password_hash`;
    END IF;

    -- phoneVerified (camelCase, matches your current Prisma field without @map)
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'phoneVerified';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `phoneVerified` DATETIME(3) NULL AFTER `phone`;
    END IF;

    -- verificationToken (camelCase)
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'verificationToken';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `verificationToken` VARCHAR(191) NULL AFTER `email_verified`;
    END IF;

    -- unique index on verificationToken
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND INDEX_NAME = 'users_verificationToken_key';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD UNIQUE INDEX `users_verificationToken_key` (`verificationToken`);
    END IF;

    -- consent_marketing
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'consent_marketing';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `consent_marketing` BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- consent_notifications
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'consent_notifications';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `consent_notifications` BOOLEAN NOT NULL DEFAULT true;
    END IF;

    -- consent_transactional
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'consent_transactional';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `consent_transactional` BOOLEAN NOT NULL DEFAULT true;
    END IF;

    -- kyc_status
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'kyc_status';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `kyc_status` ENUM('PENDING','VERIFIED','FAILED') NOT NULL DEFAULT 'PENDING';
    ELSE
      ALTER TABLE `users`
        MODIFY COLUMN `kyc_status` ENUM('PENDING','VERIFIED','FAILED') NOT NULL DEFAULT 'PENDING';
    END IF;

    -- paystack_customer_code
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'paystack_customer_code';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `paystack_customer_code` VARCHAR(191) NULL;
    END IF;

    -- plaid_access_token
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'plaid_access_token';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `plaid_access_token` VARCHAR(191) NULL;
    END IF;

    -- region (default USA)
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'region';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `region` ENUM('USA','KEN') NULL DEFAULT 'USA';
    ELSE
      ALTER TABLE `users`
        MODIFY COLUMN `region` ENUM('USA','KEN') NULL DEFAULT 'USA';
    END IF;

    -- stripe_customer_id
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'stripe_customer_id';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `stripe_customer_id` VARCHAR(191) NULL;
    END IF;

    -- twoFactorEnabled (camelCase)
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'twoFactorEnabled';
    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false;
    END IF;
  END IF;

  /* =========================================================
     3) tenant_payment_methods: create or patch canonical table
     ========================================================= */

  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users';

  IF v_exists > 0 THEN
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tenant_payment_methods';

    IF v_exists = 0 THEN
      CREATE TABLE `tenant_payment_methods` (
        `id` VARCHAR(191) NOT NULL,
        `user_id` VARCHAR(191) NOT NULL,
        `type` VARCHAR(191) NOT NULL,
        `plaid_access_token` VARCHAR(191) NULL,
        `plaid_account_id` VARCHAR(191) NULL,
        `stripe_payment_method_id` VARCHAR(191) NOT NULL,
        `is_default` BOOLEAN NOT NULL DEFAULT false,
        `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

        PRIMARY KEY (`id`),
        INDEX `tenant_payment_methods_user_id_idx` (`user_id`),
        CONSTRAINT `tenant_payment_methods_user_id_fkey`
          FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ELSE
      -- Patch key columns/defaults if table already exists
      SELECT COUNT(*) INTO v_exists
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tenant_payment_methods' AND COLUMN_NAME = 'plaid_account_id';
      IF v_exists = 0 THEN
        ALTER TABLE `tenant_payment_methods` ADD COLUMN `plaid_account_id` VARCHAR(191) NULL;
      END IF;

      SELECT COUNT(*) INTO v_exists
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tenant_payment_methods' AND COLUMN_NAME = 'stripe_payment_method_id';
      IF v_exists = 0 THEN
        ALTER TABLE `tenant_payment_methods` ADD COLUMN `stripe_payment_method_id` VARCHAR(191) NULL;
      END IF;

      SELECT COUNT(*) INTO v_exists
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tenant_payment_methods' AND COLUMN_NAME = 'is_default';
      IF v_exists > 0 THEN
        ALTER TABLE `tenant_payment_methods`
          MODIFY COLUMN `is_default` BOOLEAN NOT NULL DEFAULT false;
      END IF;

      SELECT COUNT(*) INTO v_exists
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'tenant_payment_methods'
        AND INDEX_NAME = 'tenant_payment_methods_user_id_idx';
      IF v_exists = 0 THEN
        ALTER TABLE `tenant_payment_methods`
          ADD INDEX `tenant_payment_methods_user_id_idx` (`user_id`);
      END IF;
    END IF;
  END IF;

  /* =========================================================
     4) payment: patch if table already exists (skip if not yet created)
     ========================================================= */

  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'payment';

  IF v_exists > 0 THEN
    -- amount_subunits
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'amount_subunits';
    IF v_exists = 0 THEN
      ALTER TABLE `payment`
        ADD COLUMN `amount_subunits` BIGINT NULL;
    END IF;

    -- currency => USD default (if column exists)
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'currency';
    IF v_exists > 0 THEN
      ALTER TABLE `payment`
        MODIFY COLUMN `currency` VARCHAR(3) NOT NULL DEFAULT 'USD';
    ELSE
      ALTER TABLE `payment`
        ADD COLUMN `currency` VARCHAR(3) NOT NULL DEFAULT 'USD';
    END IF;

    -- gateway
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'gateway';
    IF v_exists = 0 THEN
      ALTER TABLE `payment`
        ADD COLUMN `gateway` ENUM('STRIPE','PLAID','PAYSTACK','MPESA_DIRECT','MANUAL') NOT NULL DEFAULT 'MANUAL';
    ELSE
      ALTER TABLE `payment`
        MODIFY COLUMN `gateway` ENUM('STRIPE','PLAID','PAYSTACK','MPESA_DIRECT','MANUAL') NOT NULL DEFAULT 'MANUAL';
    END IF;

    -- gateway_reference
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'gateway_reference';
    IF v_exists = 0 THEN
      ALTER TABLE `payment`
        ADD COLUMN `gateway_reference` VARCHAR(191) NULL;
    END IF;

    -- risk_score
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'risk_score';
    IF v_exists = 0 THEN
      ALTER TABLE `payment`
        ADD COLUMN `risk_score` INT NULL;
    END IF;

    -- status (TransactionStatus / payment_status)
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'status';
    IF v_exists = 0 THEN
      ALTER TABLE `payment`
        ADD COLUMN `status` ENUM('PENDING','AUTHORIZED','SETTLED','FAILED','DISPUTED','REVERSED') NOT NULL DEFAULT 'PENDING';
    ELSE
      ALTER TABLE `payment`
        MODIFY COLUMN `status` ENUM('PENDING','AUTHORIZED','SETTLED','FAILED','DISPUTED','REVERSED') NOT NULL DEFAULT 'PENDING';
    END IF;

    -- type (TransactionType / payment_type)
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'type';
    IF v_exists = 0 THEN
      ALTER TABLE `payment`
        ADD COLUMN `type` ENUM('RENT','DEPOSIT','SAAS_FEE','MAINTENANCE') NOT NULL DEFAULT 'RENT';
    ELSE
      ALTER TABLE `payment`
        MODIFY COLUMN `type` ENUM('RENT','DEPOSIT','SAAS_FEE','MAINTENANCE') NOT NULL DEFAULT 'RENT';
    END IF;

    -- metadata
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'metadata';
    IF v_exists = 0 THEN
      ALTER TABLE `payment`
        ADD COLUMN `metadata` JSON NULL;
    END IF;

    -- indexes (add if missing by name)
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND INDEX_NAME = 'payment_gateway_reference_idx';
    IF v_exists = 0 THEN
      ALTER TABLE `payment`
        ADD INDEX `payment_gateway_reference_idx` (`gateway_reference`);
    END IF;

    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND INDEX_NAME = 'payment_status_idx';
    IF v_exists = 0 THEN
      ALTER TABLE `payment`
        ADD INDEX `payment_status_idx` (`status`);
    END IF;
  END IF;

END $$
DELIMITER ;

CALL rf360_patch_payment_infra_usa_usd();

DROP PROCEDURE rf360_patch_payment_infra_usa_usd;
