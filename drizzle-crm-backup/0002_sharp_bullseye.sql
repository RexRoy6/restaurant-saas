DROP INDEX `history_contract_idx` ON `contract_history`;--> statement-breakpoint
DROP INDEX `contract_items_contract_idx` ON `contract_items`;--> statement-breakpoint
DROP INDEX `contract_items_service_idx` ON `contract_items`;--> statement-breakpoint
DROP INDEX `contracts_event_idx` ON `contracts`;--> statement-breakpoint
DROP INDEX `payments_contract_idx` ON `payments`;--> statement-breakpoint
DROP INDEX `refunds_payment_idx` ON `refunds`;--> statement-breakpoint
ALTER TABLE `contract_history` MODIFY COLUMN `changed_by` bigint;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `company_id` bigint;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','owner','user') NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contract_history` ADD CONSTRAINT `contract_history_contract_id_contracts_id_fk` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contract_history` ADD CONSTRAINT `contract_history_changed_by_users_id_fk` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contract_items` ADD CONSTRAINT `contract_items_contract_id_contracts_id_fk` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contract_items` ADD CONSTRAINT `contract_items_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_contract_id_contracts_id_fk` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_payment_id_payments_id_fk` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `clients_user_idx` ON `clients` (`user_id`);--> statement-breakpoint
CREATE INDEX `contracts_client_idx` ON `contracts` (`client_id`);