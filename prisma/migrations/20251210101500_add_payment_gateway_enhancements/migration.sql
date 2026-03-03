-- Migration: Add payment gateway enhancements
-- This migration adds support for multiple payment gateways and enhances the payment model

-- 1. Add new payment method enum values
-- MySQL does not support adding enum values directly, so we need to recreate the column
-- First, check if the column exists and its current definition
-- We'll create a temporary column, copy data, drop old column, rename

-- Note: This is a complex operation that may require downtime in production
-- For safety, we'll use multiple steps

-- Step 1: Add metadata column to payment table (nullable JSON)
ALTER TABLE `payment` ADD COLUMN `metadata` JSON DEFAULT NULL;

-- Step 2: Update existing payment records with default values for new fields if needed
-- No action needed as columns have defaults

-- Step 3: Ensure TenantPaymentMethod table exists (should already exist from previous migration)
-- The table creation is already handled in previous migrations

-- Step 4: Add payment_method enum values
-- Since MySQL doesn't support adding enum values easily, we'll modify the column definition
-- This will drop and recreate the column with the new enum values
-- We need to preserve existing data
SET @old_default = NULL;

-- Get the current default value
SELECT COLUMN_DEFAULT INTO @old_default 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'payment' 
AND COLUMN_NAME = 'method';

-- Create a temporary column with the new enum values
ALTER TABLE `payment` 
ADD COLUMN `method_new` ENUM('CASH', 'BANK', 'CREDIT_CARD', 'MPESA', 'PAYPAL', 'STRIPE', 'PAYSTACK', 'MANUAL') 
DEFAULT IFNULL(@old_default, 'CASH');

-- Copy data from old column to new column
UPDATE `payment` SET `method_new` = `method`;

-- Drop the old column
ALTER TABLE `payment` DROP COLUMN `method`;

-- Rename the new column to the original name
ALTER TABLE `payment` CHANGE COLUMN `method_new` `method` ENUM('CASH', 'BANK', 'CREDIT_CARD', 'MPESA', 'PAYPAL', 'STRIPE', 'PAYSTACK', 'MANUAL');

-- Step 5: Add payment_gateway enum values (if needed)
-- The PaymentGateway enum is already defined in Prisma schema and mapped to the `gateway` column
-- No column alteration needed as it's already ENUM('STRIPE', 'PLAID', 'PAYSTACK', 'MPESA_DIRECT', 'MANUAL')

-- Step 6: Add comment to document the changes
ALTER TABLE `payment` 
COMMENT = 'Enhanced payment gateway support with metadata and additional payment methods';

-- Step 7: Update any foreign key constraints if needed (none required)

-- Migration completed successfully