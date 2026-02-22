-- RentFlow360 payment/region alignment patch (MySQL 8+) — 10/10 hardened (USA standard)
-- NOTE: DB patch only. Prisma P1012 duplicates must still be removed in schema.prisma.

DELIMITER $$

DROP PROCEDURE IF EXISTS rf360_patch_payment_infra_usa_usd $$
CREATE PROCEDURE rf360_patch_payment_infra_usa_usd()
BEGIN
  DECLARE v_exists BIGINT DEFAULT 0;
  DECLARE v_type VARCHAR(64) DEFAULT NULL;
  DECLARE v_dup_count BIGINT DEFAULT 0;

  /* =========================================================
     0) Expand role enums to include AGENT (correct table names)
     Tables:
       - invite (your Prisma @@map("invite"))
       - organization_users (your Prisma @@map("organization_users"))
       - sidebar_items (your Prisma @@map("sidebar_items"))
     ========================================================= */

  -- invite.role
  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'invite'
    AND COLUMN_NAME = 'role';

  IF v_exists > 0 THEN
    ALTER TABLE `invite`
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

  -- sidebar_items.role
  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sidebar_items'
    AND COLUMN_NAME = 'role';

  IF v_exists > 0 THEN
    ALTER TABLE `sidebar_items`
      MODIFY COLUMN `role`
      ENUM('SYSTEM_ADMIN','PROPERTY_MANAGER','TENANT','AGENT','VENDOR','ALL') NOT NULL;
  END IF;

  /* =========================================================
     1) organizations: payment settlement columns + region
     Canonical region enum: USA / AFRICA / GLOBAL (default USA)
     ========================================================= */

  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'organizations';

  IF v_exists > 0 THEN
    -- region
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'organizations'
      AND COLUMN_NAME = 'region';

    IF v_exists = 0 THEN
      ALTER TABLE `organizations`
        ADD COLUMN `region` ENUM('USA','AFRICA','GLOBAL') NULL DEFAULT 'USA';
    ELSE
      -- widen to allow legacy 'KEN' safely, normalize, then lock down
      ALTER TABLE `organizations`
        MODIFY COLUMN `region` ENUM('USA','KEN','AFRICA','GLOBAL') NULL DEFAULT 'USA';

      UPDATE `organizations`
      SET `region` = 'AFRICA'
      WHERE `region` = 'KEN';

      ALTER TABLE `organizations`
        MODIFY COLUMN `region` ENUM('USA','AFRICA','GLOBAL') NULL DEFAULT 'USA';
    END IF;

    -- paystack_subaccount_code
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'organizations'
      AND COLUMN_NAME = 'paystack_subaccount_code';

    IF v_exists = 0 THEN
      ALTER TABLE `organizations`
        ADD COLUMN `paystack_subaccount_code` VARCHAR(191) NULL;
    END IF;

    -- stripe_connect_id
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'organizations'
      AND COLUMN_NAME = 'stripe_connect_id';

    IF v_exists = 0 THEN
      ALTER TABLE `organizations`
        ADD COLUMN `stripe_connect_id` VARCHAR(191) NULL;
    END IF;
  END IF;

  /* =========================================================
     2) users: email_verified conversion + payment profile fields
     Canonical region enum: USA / AFRICA / GLOBAL (default USA)
     ========================================================= */

  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users';

  IF v_exists > 0 THEN
    -- email_verified BOOLEAN/BIT -> DATETIME(3) NULL
    SET v_type = NULL;
    SELECT DATA_TYPE INTO v_type
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'email_verified'
    LIMIT 1;

    IF v_type IS NOT NULL THEN
      IF v_type IN ('tinyint','bit','boolean') THEN
        SELECT COUNT(*) INTO v_exists
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
          AND COLUMN_NAME = 'email_verified_tmp';

        IF v_exists = 0 THEN
          ALTER TABLE `users`
            ADD COLUMN `email_verified_tmp` DATETIME(3) NULL;
        END IF;

        UPDATE `users`
        SET `email_verified_tmp` = COALESCE(`email_verified_tmp`, `created_at`)
        WHERE `email_verified` = 1;

        ALTER TABLE `users` DROP COLUMN `email_verified`;
        ALTER TABLE `users`
          CHANGE COLUMN `email_verified_tmp` `email_verified` DATETIME(3) NULL;

      ELSEIF v_type IN ('datetime','timestamp') THEN
        ALTER TABLE `users`
          MODIFY COLUMN `email_verified` DATETIME(3) NULL;
      END IF;
    ELSE
      ALTER TABLE `users`
        ADD COLUMN `email_verified` DATETIME(3) NULL;
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

    -- region
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'region';

    IF v_exists = 0 THEN
      ALTER TABLE `users`
        ADD COLUMN `region` ENUM('USA','AFRICA','GLOBAL') NULL DEFAULT 'USA';
    ELSE
      ALTER TABLE `users`
        MODIFY COLUMN `region` ENUM('USA','KEN','AFRICA','GLOBAL') NULL DEFAULT 'USA';

      UPDATE `users`
      SET `region` = 'AFRICA'
      WHERE `region` = 'KEN';

      ALTER TABLE `users`
        MODIFY COLUMN `region` ENUM('USA','AFRICA','GLOBAL') NULL DEFAULT 'USA';
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
  END IF;

  /* =========================================================
     3) tenant_payment_methods: create or patch
     ========================================================= */

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
      `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
      `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (`id`),
      INDEX `tenant_payment_methods_user_id_idx` (`user_id`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  END IF;

  -- ensure updated_at ON UPDATE
  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tenant_payment_methods'
    AND COLUMN_NAME = 'updated_at';

  IF v_exists > 0 THEN
    ALTER TABLE `tenant_payment_methods`
      MODIFY COLUMN `updated_at` DATETIME(3) NOT NULL
      DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);
  END IF;

  -- ensure FK exists if data is clean
  SELECT COUNT(*) INTO v_exists
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tenant_payment_methods'
    AND CONSTRAINT_NAME = 'tenant_payment_methods_user_id_fkey';

  IF v_exists = 0 THEN
    SELECT COUNT(*) INTO v_dup_count
    FROM `tenant_payment_methods` t
    LEFT JOIN `users` u ON u.`id` = t.`user_id`
    WHERE u.`id` IS NULL;

    IF v_dup_count = 0 THEN
      ALTER TABLE `tenant_payment_methods`
        ADD CONSTRAINT `tenant_payment_methods_user_id_fkey`
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END IF;

  /* =========================================================
     4) payment table patch (only if exists)
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
      ALTER TABLE `payment` ADD COLUMN `amount_subunits` BIGINT NULL;
    END IF;

    -- currency default USD
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'currency';
    IF v_exists = 0 THEN
      ALTER TABLE `payment` ADD COLUMN `currency` VARCHAR(3) NOT NULL DEFAULT 'USD';
    ELSE
      ALTER TABLE `payment` MODIFY COLUMN `currency` VARCHAR(3) NOT NULL DEFAULT 'USD';
    END IF;

    UPDATE `payment` SET `currency` = 'USD' WHERE `currency` IS NULL OR `currency` = '';

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

    -- status
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

    -- type
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
      ALTER TABLE `payment` ADD COLUMN `metadata` JSON NULL;
    END IF;

    -- gateway_reference
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'gateway_reference';
    IF v_exists = 0 THEN
      ALTER TABLE `payment` ADD COLUMN `gateway_reference` VARCHAR(191) NULL;
    END IF;

    -- risk_score
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'risk_score';
    IF v_exists = 0 THEN
      ALTER TABLE `payment` ADD COLUMN `risk_score` INT NULL;
    END IF;

    -- indexes
    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND INDEX_NAME = 'payment_gateway_reference_idx';
    IF v_exists = 0 THEN
      ALTER TABLE `payment` ADD INDEX `payment_gateway_reference_idx` (`gateway_reference`);
    END IF;

    SELECT COUNT(*) INTO v_exists
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND INDEX_NAME = 'payment_status_idx';
    IF v_exists = 0 THEN
      ALTER TABLE `payment` ADD INDEX `payment_status_idx` (`status`);
    END IF;
  END IF;

  SELECT 'rf360_patch_payment_infra_usa_usd completed' AS message;
END $$
DELIMITER ;

CALL rf360_patch_payment_infra_usa_usd();
DROP PROCEDURE rf360_patch_payment_infra_usa_usd;

