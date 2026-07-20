-- ipartners.com — additive schema on the SHARED contrib_rdb.
-- Additive only. All tables prefixed ipp_. Applied via:
--   npm run db:apply prisma/migrations/0001_ipp_auth.sql
-- (the apply script refuses any DROP/TRUNCATE/RENAME outside the ipp_ prefix)

CREATE TABLE IF NOT EXISTS `ipp_auth_codes` (
  `token`      VARCHAR(191) NOT NULL,
  `email`      VARCHAR(191) NOT NULL,
  `code`       VARCHAR(12)  NOT NULL,
  `attempts`   INT          NOT NULL DEFAULT 0,
  `next`       VARCHAR(255) NULL,
  `expires_at` DATETIME(3)  NOT NULL,
  `consumed`   TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`token`),
  KEY `idx_ipp_auth_codes_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
