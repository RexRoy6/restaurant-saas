CREATE TABLE `categories` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`name` varchar(120) NOT NULL,
	`sort_order` bigint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_company_name_unique` UNIQUE(`company_id`,`name`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `category_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `categories_company_sort_order_idx` ON `categories` (`company_id`,`sort_order`);--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_id`);