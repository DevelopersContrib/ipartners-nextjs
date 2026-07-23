-- Signup profiles for iPartners (additive, ipp_ only).
-- Applied via: npm run db:apply prisma/migrations/0002_ipp_partners.sql
--
-- We do NOT create contrib Members rows here — that table is shared production
-- with many NOT NULL columns we don't own. Identity for brand-new partners lives
-- in ipp_partners until/unless they already exist in Members.

CREATE TABLE IF NOT EXISTS `ipp_partners` (
  `email`       VARCHAR(191) NOT NULL,
  `first_name`  VARCHAR(100) NOT NULL,
  `last_name`   VARCHAR(100) NOT NULL,
  `company`     VARCHAR(191) NULL,
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Carry signup name fields with the one-time code so verify cannot forge a profile.
ALTER TABLE `ipp_auth_codes`
  ADD COLUMN `first_name` VARCHAR(100) NULL AFTER `next`,
  ADD COLUMN `last_name`  VARCHAR(100) NULL AFTER `first_name`,
  ADD COLUMN `company`    VARCHAR(191) NULL AFTER `last_name`;
