ALTER TABLE `clients` MODIFY COLUMN `company_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `contract_history` MODIFY COLUMN `contract_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `contract_history` MODIFY COLUMN `changed_by` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `contract_items` MODIFY COLUMN `contract_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `contract_items` MODIFY COLUMN `service_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `contract_items` MODIFY COLUMN `quantity` int NOT NULL;--> statement-breakpoint
ALTER TABLE `contracts` MODIFY COLUMN `company_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `contracts` MODIFY COLUMN `client_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `contracts` MODIFY COLUMN `event_date` date NOT NULL;--> statement-breakpoint
ALTER TABLE `contracts` MODIFY COLUMN `status` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `contracts` MODIFY COLUMN `total_amount` decimal(12,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `contract_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `amount` decimal(12,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `refunds` MODIFY COLUMN `payment_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `company_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `stock_total` int NOT NULL;--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `price_base` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `company_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password_hash` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `clients` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `companies` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `companies` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `contract_history` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `contract_history` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `contract_history` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `contract_items` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `contract_items` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `contract_items` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `contracts` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `contracts` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `contracts` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `payments` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `payments` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `refunds` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `refunds` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `refunds` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `services` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `services` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `services` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` ADD `deleted_at` timestamp;--> statement-breakpoint
CREATE INDEX `clients_company_idx` ON `clients` (`company_id`);--> statement-breakpoint
CREATE INDEX `history_contract_idx` ON `contract_history` (`contract_id`);--> statement-breakpoint
CREATE INDEX `contract_items_contract_idx` ON `contract_items` (`contract_id`);--> statement-breakpoint
CREATE INDEX `contract_items_service_idx` ON `contract_items` (`service_id`);--> statement-breakpoint
CREATE INDEX `contracts_company_idx` ON `contracts` (`company_id`);--> statement-breakpoint
CREATE INDEX `contracts_event_idx` ON `contracts` (`event_date`);--> statement-breakpoint
CREATE INDEX `payments_contract_idx` ON `payments` (`contract_id`);--> statement-breakpoint
CREATE INDEX `refunds_payment_idx` ON `refunds` (`payment_id`);--> statement-breakpoint
CREATE INDEX `services_company_idx` ON `services` (`company_id`);--> statement-breakpoint
CREATE INDEX `users_company_idx` ON `users` (`company_id`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);