-- Partner AI agent conversation (pending qualification).
-- Applied via: pnpm run db:apply prisma/migrations/0006_ipp_agent_message.sql
-- Additive only. Never touch MarketPartnership.

CREATE TABLE IF NOT EXISTS `ipp_agent_message` (
  `id`             BIGINT AUTO_INCREMENT PRIMARY KEY,
  `engagement_id`  BIGINT NOT NULL,
  `email`          VARCHAR(255) NOT NULL,
  `role`           VARCHAR(16)  NOT NULL,
  `content`        MEDIUMTEXT   NOT NULL,
  `meta_json`      TEXT NULL,
  `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_engagement` (`engagement_id`),
  KEY `idx_email` (`email`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
