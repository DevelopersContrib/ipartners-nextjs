-- Store structured apply answers for admin review (additive, ipp_ only).
-- Applied via: npm run db:apply prisma/migrations/0005_ipp_engagement_application.sql

ALTER TABLE `ipp_engagement`
  ADD COLUMN `application_json` MEDIUMTEXT NULL AFTER `source_id`;
