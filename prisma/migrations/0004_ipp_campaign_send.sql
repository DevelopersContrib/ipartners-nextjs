-- Automated campaign send log (SES). Additive, ipp_ only.
-- Applied via: npm run db:apply prisma/migrations/0004_ipp_campaign_send.sql
--
-- One row per (engagement, campaign_key) — keeps status-change emails idempotent.
-- Force-resend from admin deletes/replaces this row.

CREATE TABLE IF NOT EXISTS `ipp_campaign_send` (
  `id`             BIGINT AUTO_INCREMENT PRIMARY KEY,
  `engagement_id`  BIGINT NOT NULL,
  `campaign_key`   VARCHAR(64)  NOT NULL,
  `email`          VARCHAR(255) NOT NULL,
  `send_status`    VARCHAR(24)  NOT NULL DEFAULT 'sent',
  `provider_id`    VARCHAR(191) NULL,
  `error`          VARCHAR(500) NULL,
  `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_engagement_campaign` (`engagement_id`, `campaign_key`),
  KEY `idx_campaign_email` (`email`),
  KEY `idx_campaign_key` (`campaign_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
