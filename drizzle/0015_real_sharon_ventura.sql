DROP INDEX `events_company_event_date_idx` ON `events`;--> statement-breakpoint
ALTER TABLE `events` ADD `event_start` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `event_end` datetime NOT NULL;--> statement-breakpoint
CREATE INDEX `events_company_event_date_idx` ON `events` (`company_id`,`event_start`);--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `event_date`;