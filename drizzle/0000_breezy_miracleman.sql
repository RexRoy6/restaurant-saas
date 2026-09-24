CREATE TABLE `clients` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint,
	`user_id` bigint,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_history` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`contract_id` bigint,
	`changed_by` bigint,
	`old_value` varchar(255),
	`new_value` varchar(255),
	CONSTRAINT `contract_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_items` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`contract_id` bigint,
	`service_id` bigint,
	`quantity` int,
	CONSTRAINT `contract_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint,
	`client_id` bigint,
	`event_date` date,
	`status` varchar(50),
	`total_amount` decimal(12,2),
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`contract_id` bigint,
	`amount` decimal(12,2),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refunds` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`payment_id` bigint,
	CONSTRAINT `refunds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint,
	`stock_total` int,
	`price_base` decimal(10,2),
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint,
	`role` varchar(50) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255),
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
