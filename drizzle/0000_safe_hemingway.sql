CREATE TABLE `checks` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`name` varchar(255),
	`note` varchar(500),
	`status` enum('OPEN','CLOSED','CANCELLED') NOT NULL DEFAULT 'OPEN',
	`closed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`currency` enum('MXN') NOT NULL DEFAULT 'MXN',
	`timezone_id` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`order_id` bigint NOT NULL,
	`product_id` bigint NOT NULL,
	`product_name` varchar(255) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`unit_price_in_cents` bigint NOT NULL,
	`quantity` bigint NOT NULL,
	`subtotal_in_cents` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `order_items_unit_price_non_negative` CHECK(`order_items`.`unit_price_in_cents` >= 0),
	CONSTRAINT `order_items_quantity_positive` CHECK(`order_items`.`quantity` > 0),
	CONSTRAINT `order_items_subtotal_non_negative` CHECK(`order_items`.`subtotal_in_cents` >= 0)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`check_id` bigint NOT NULL,
	`status` enum('PENDING','PREPARING','READY','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`cancelled_at` timestamp,
	`cancelled_by` bigint,
	`cancellation_reason` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`check_id` bigint NOT NULL,
	`amount_in_cents` bigint NOT NULL,
	`payment_method` enum('CASH','CARD','TRANSFER') NOT NULL,
	`paid_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_amount_positive` CHECK(`payments`.`amount_in_cents` > 0)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`name` varchar(255) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`price_in_cents` bigint NOT NULL,
	`is_available` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_company_sku_unique` UNIQUE(`company_id`,`sku`),
	CONSTRAINT `products_price_non_negative` CHECK(`products`.`price_in_cents` >= 0)
);
--> statement-breakpoint
CREATE TABLE `timezones` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`label` varchar(150) NOT NULL,
	CONSTRAINT `timezones_id` PRIMARY KEY(`id`),
	CONSTRAINT `timezones_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint,
	`role` enum('admin','owner','employee') NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`password_changed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `checks` ADD CONSTRAINT `checks_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `companies` ADD CONSTRAINT `companies_timezone_id_timezones_id_fk` FOREIGN KEY (`timezone_id`) REFERENCES `timezones`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_check_id_checks_id_fk` FOREIGN KEY (`check_id`) REFERENCES `checks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_cancelled_by_users_id_fk` FOREIGN KEY (`cancelled_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_check_id_checks_id_fk` FOREIGN KEY (`check_id`) REFERENCES `checks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `checks_company_status_idx` ON `checks` (`company_id`,`status`);--> statement-breakpoint
CREATE INDEX `companies_timezone_idx` ON `companies` (`timezone_id`);--> statement-breakpoint
CREATE INDEX `order_items_company_idx` ON `order_items` (`company_id`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_product_idx` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `orders_check_idx` ON `orders` (`check_id`);--> statement-breakpoint
CREATE INDEX `orders_company_status_idx` ON `orders` (`company_id`,`status`);--> statement-breakpoint
CREATE INDEX `orders_cancelled_by_idx` ON `orders` (`cancelled_by`);--> statement-breakpoint
CREATE INDEX `payments_check_idx` ON `payments` (`check_id`);--> statement-breakpoint
CREATE INDEX `payments_company_paid_at_idx` ON `payments` (`company_id`,`paid_at`);--> statement-breakpoint
CREATE INDEX `users_company_idx` ON `users` (`company_id`);