ALTER TABLE `checks` ADD `cancelled_at` timestamp;--> statement-breakpoint
ALTER TABLE `checks` ADD `cancelled_by` bigint;--> statement-breakpoint
ALTER TABLE `checks` ADD `cancellation_reason` varchar(500);--> statement-breakpoint
ALTER TABLE `checks` ADD CONSTRAINT `checks_cancelled_by_users_id_fk` FOREIGN KEY (`cancelled_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `checks_cancelled_by_idx` ON `checks` (`cancelled_by`);