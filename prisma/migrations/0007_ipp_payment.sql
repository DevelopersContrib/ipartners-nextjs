-- PayDirect sponsor checkout payments.
-- Applied via: pnpm run db:apply prisma/migrations/0007_ipp_payment.sql

CREATE TABLE IF NOT EXISTS `ipp_payment` (
  `id`                   BIGINT AUTO_INCREMENT PRIMARY KEY,
  `engagement_id`        BIGINT NULL,
  `email`                VARCHAR(255) NOT NULL,
  `provider`             VARCHAR(32)  NOT NULL DEFAULT 'paydirect',
  `provider_payment_id`  VARCHAR(191) NOT NULL,
  `status`               VARCHAR(32)  NOT NULL DEFAULT 'created',
  `tier`                 VARCHAR(32)  NULL,
  `vertical`             VARCHAR(255) NULL,
  `amount`               VARCHAR(32)  NOT NULL,
  `currency`             VARCHAR(16)  NOT NULL DEFAULT 'USD',
  `payment_method`       VARCHAR(32)  NULL,
  `metadata_json`        TEXT NULL,
  `created_at`           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_provider_payment` (`provider`, `provider_payment_id`),
  KEY `idx_email` (`email`),
  KEY `idx_engagement` (`engagement_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
