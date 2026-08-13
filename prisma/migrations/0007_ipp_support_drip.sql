-- Support inbox + Emails & AI (drip) for iPartner.
-- Applied via: pnpm run db:apply prisma/migrations/0007_ipp_support_drip.sql
-- Additive only. site / domain_key = 'ipartner'. Public ids: IP-#####.

CREATE TABLE IF NOT EXISTS `ipp_support_tickets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `public_id` VARCHAR(24) NOT NULL,
  `member_id` INT NULL,
  `requester_email` VARCHAR(255) NULL,
  `requester_name` VARCHAR(120) NULL,
  `source` VARCHAR(40) NOT NULL DEFAULT 'contact_form',
  `site` VARCHAR(40) NULL,
  `subject` VARCHAR(200) NOT NULL,
  `category` VARCHAR(40) NOT NULL DEFAULT 'other',
  `priority` VARCHAR(20) NOT NULL DEFAULT 'normal',
  `status` VARCHAR(40) NOT NULL DEFAULT 'open',
  `assigned_admin_id` INT NULL,
  `ai_handling` TINYINT(1) NOT NULL DEFAULT 1,
  `ai_turn_count` INT NOT NULL DEFAULT 0,
  `escalated_at` DATETIME NULL,
  `escalation_reason` VARCHAR(500) NULL,
  `last_message_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ipp_support_tickets_public_id` (`public_id`),
  KEY `idx_ipp_support_site_status` (`site`, `status`, `last_message_at`),
  KEY `idx_ipp_support_requester_email` (`requester_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ipp_support_ticket_messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ticket_id` INT NOT NULL,
  `author_type` VARCHAR(20) NOT NULL,
  `author_id` INT NULL,
  `body` TEXT NOT NULL,
  `is_internal` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ipp_support_msgs_ticket` (`ticket_id`),
  KEY `idx_ipp_support_msgs_ticket_created` (`ticket_id`, `created_at`),
  CONSTRAINT `ipp_support_msgs_ticket_fk`
    FOREIGN KEY (`ticket_id`) REFERENCES `ipp_support_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ipp_drip_segments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `domain_key` VARCHAR(40) NOT NULL DEFAULT 'ipartner',
  `segment_key` VARCHAR(64) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `rules_json` TEXT NOT NULL,
  `source` VARCHAR(24) NOT NULL DEFAULT 'ai',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ipp_drip_segments` (`domain_key`, `segment_key`),
  KEY `idx_ipp_drip_segments_domain` (`domain_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ipp_drip_campaigns` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `domain_key` VARCHAR(40) NOT NULL DEFAULT 'ipartner',
  `campaign_key` VARCHAR(64) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `segment_key` VARCHAR(64) NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ipp_drip_campaigns` (`domain_key`, `campaign_key`),
  KEY `idx_ipp_drip_campaigns_domain` (`domain_key`),
  KEY `idx_ipp_drip_campaigns_segment` (`domain_key`, `segment_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ipp_drip_steps` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `domain_key` VARCHAR(40) NOT NULL DEFAULT 'ipartner',
  `campaign_key` VARCHAR(64) NOT NULL,
  `vnoc_mail_id` INT NOT NULL,
  `step_order` INT NOT NULL DEFAULT 0,
  `delay_days` INT NOT NULL DEFAULT 0,
  `subject` VARCHAR(200) NOT NULL,
  `body_html` TEXT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `synced_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ipp_drip_steps_mail` (`domain_key`, `vnoc_mail_id`),
  KEY `idx_ipp_drip_steps_campaign` (`domain_key`, `campaign_key`, `step_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ipp_drip_enrollments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `domain_key` VARCHAR(40) NOT NULL DEFAULT 'ipartner',
  `user_id` INT NOT NULL,
  `campaign_key` VARCHAR(64) NOT NULL,
  `status` VARCHAR(24) NOT NULL DEFAULT 'active',
  `current_step` INT NOT NULL DEFAULT 0,
  `next_at` DATETIME NULL,
  `context_json` TEXT NULL,
  `enrolled_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ipp_drip_enroll` (`domain_key`, `user_id`, `campaign_key`),
  KEY `idx_ipp_drip_enroll_due` (`domain_key`, `status`, `next_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ipp_drip_sends` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `enrollment_id` INT NOT NULL,
  `step_order` INT NOT NULL,
  `vnoc_mail_id` INT NULL,
  `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(24) NOT NULL DEFAULT 'sent',
  `error` VARCHAR(500) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ipp_drip_send` (`enrollment_id`, `step_order`),
  KEY `idx_ipp_drip_sends_enrollment` (`enrollment_id`),
  CONSTRAINT `ipp_drip_sends_enrollment_fk`
    FOREIGN KEY (`enrollment_id`) REFERENCES `ipp_drip_enrollments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
