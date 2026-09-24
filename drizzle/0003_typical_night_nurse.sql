ALTER TABLE `contracts` MODIFY COLUMN `status` enum('draft','active','cancelled','completed') NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `phone` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `contract_items` ADD `unit_price` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `contracts` ADD `event_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `currency` enum('MXN','USD') NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `payment_method` varchar(50);--> statement-breakpoint
ALTER TABLE `services` ADD `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `services` ADD `description` varchar(500);--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `contracts_company_event_date_idx` ON `contracts` (`company_id`,`event_date`);--> statement-breakpoint
CREATE INDEX `contracts_status_idx` ON `contracts` (`status`);--> statement-breakpoint
CREATE INDEX `services_name_idx` ON `services` (`name`);