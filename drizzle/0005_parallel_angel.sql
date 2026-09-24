CREATE TABLE `events` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`client_id` bigint NOT NULL,
	`name` varchar(255) NOT NULL,
	`event_date` date NOT NULL,
	`location` varchar(255),
	`notes` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP INDEX `contracts_company_event_date_idx` ON `contracts`;--> statement-breakpoint
ALTER TABLE `contracts` ADD `event_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `events_company_client_idx` ON `events` (`company_id`,`client_id`);--> statement-breakpoint
CREATE INDEX `events_client_idx` ON `events` (`client_id`);--> statement-breakpoint
CREATE INDEX `events_company_event_date_idx` ON `events` (`company_id`,`event_date`);--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `contracts_event_idx` ON `contracts` (`event_id`);--> statement-breakpoint
ALTER TABLE `contracts` DROP COLUMN `event_name`;--> statement-breakpoint
ALTER TABLE `contracts` DROP COLUMN `event_date`;