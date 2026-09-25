ALTER TABLE `events` MODIFY COLUMN `event_start` datetime;--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `event_end` datetime;--> statement-breakpoint
ALTER TABLE `events` ADD `event_date` datetime NOT NULL;