-- Schema DDL for MySQL (Gerenciador)
-- Safe to run multiple times (uses IF NOT EXISTS)

-- 1) Database
CREATE DATABASE IF NOT EXISTS `gerenciador`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `gerenciador`;

-- 2) Tables
-- 2.1) Bank Accounts
CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `bank_name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `account_number` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_bank_accounts_account_number` (`account_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2) Cards (fk -> bank_accounts.id)
CREATE TABLE IF NOT EXISTS `cards` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(100) NULL,
  `last_digits` VARCHAR(4) NULL,
  `bank_account_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_cards_bank_account_id` (`bank_account_id`),
  CONSTRAINT `fk_cards_bank_account`
    FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.3) Transactions (standalone)
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(32) NOT NULL, -- DESPESA | RECEITA
  `amount` DECIMAL(19,2) NOT NULL,
  `description` VARCHAR(200) NULL,
  `date` DATE NULL,
  `category` VARCHAR(100) NULL,
  `recurring` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_transactions_date` (`date`),
  INDEX `idx_transactions_category` (`category`),
  INDEX `idx_transactions_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notes:
-- - Collation/charset set to utf8mb4 for proper Unicode support.
-- - Foreign key ON DELETE/UPDATE set to RESTRICT (adjust to CASCADE if desired).
-- - Booleans stored as TINYINT(1) per MySQL convention.
-- - Column `type` is quoted with backticks to avoid keyword issues.
