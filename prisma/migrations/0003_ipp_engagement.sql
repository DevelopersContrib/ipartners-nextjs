-- Phase 2 — unify partnerships into ipp_engagement.
-- Applied via: npm run db:apply prisma/migrations/0003_ipp_engagement.sql
-- Additive only. Never write MarketPartnership from this app.

CREATE TABLE IF NOT EXISTS `ipp_engagement` (
  `id`            BIGINT AUTO_INCREMENT PRIMARY KEY,
  `member_id`     BIGINT NULL,
  `email`         VARCHAR(255) NOT NULL,
  `mode`          VARCHAR(32)  NOT NULL,
  `scope_type`    VARCHAR(16)  NOT NULL DEFAULT 'domain',
  `scope_value`   VARCHAR(255) NULL,
  `status`        VARCHAR(24)  NOT NULL DEFAULT 'pending',
  `tier`          VARCHAR(32)  NULL,
  `term_start`    DATE NULL,
  `term_end`      DATE NULL,
  `source_table`  VARCHAR(64)  NULL,
  `source_id`     BIGINT       NULL,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_source` (`source_table`, `source_id`),
  KEY `idx_email` (`email`),
  KEY `idx_member` (`member_id`),
  KEY `idx_mode_status` (`mode`, `status`),
  KEY `idx_scope` (`scope_type`, `scope_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
