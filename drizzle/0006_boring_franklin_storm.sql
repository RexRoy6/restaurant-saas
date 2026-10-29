CREATE TABLE `modifier_groups` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`name` varchar(120) NOT NULL,
	`min_selections` bigint NOT NULL DEFAULT 0,
	`max_selections` bigint NOT NULL DEFAULT 1,
	`sort_order` bigint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `modifier_groups_id` PRIMARY KEY(`id`),
	CONSTRAINT `modifier_groups_company_name_unique` UNIQUE(`company_id`,`name`),
	CONSTRAINT `modifier_groups_selection_range_check` CHECK(`modifier_groups`.`min_selections` >= 0 AND `modifier_groups`.`max_selections` >= 1 AND `modifier_groups`.`min_selections` <= `modifier_groups`.`max_selections`)
);
--> statement-breakpoint
CREATE TABLE `modifier_options` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`group_id` bigint NOT NULL,
	`name` varchar(120) NOT NULL,
	`price_in_cents` bigint NOT NULL DEFAULT 0,
	`is_available` boolean NOT NULL DEFAULT true,
	`sort_order` bigint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `modifier_options_id` PRIMARY KEY(`id`),
	CONSTRAINT `modifier_options_group_name_unique` UNIQUE(`group_id`,`name`),
	CONSTRAINT `modifier_options_price_non_negative` CHECK(`modifier_options`.`price_in_cents` >= 0)
);
--> statement-breakpoint
CREATE TABLE `order_item_modifiers` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`order_item_id` bigint NOT NULL,
	`modifier_group_id` bigint NOT NULL,
	`modifier_option_id` bigint NOT NULL,
	`group_name` varchar(120) NOT NULL,
	`option_name` varchar(120) NOT NULL,
	`price_in_cents` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `order_item_modifiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `order_item_modifiers_item_option_unique` UNIQUE(`order_item_id`,`modifier_option_id`),
	CONSTRAINT `order_item_modifiers_price_non_negative` CHECK(`order_item_modifiers`.`price_in_cents` >= 0)
);

--> statement-breakpoint
CREATE TABLE `product_modifier_groups` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`product_id` bigint NOT NULL,
	`group_id` bigint NOT NULL,
	`sort_order` bigint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `product_modifier_groups_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_modifier_groups_product_group_unique` UNIQUE(`product_id`,`group_id`)
);
--> statement-breakpoint

ALTER TABLE `order_items`
ADD COLUMN `base_unit_price_in_cents` bigint NULL;
--> statement-breakpoint

UPDATE `order_items`
SET `base_unit_price_in_cents` = `unit_price_in_cents`
WHERE `base_unit_price_in_cents` IS NULL;
--> statement-breakpoint

ALTER TABLE `order_items`
MODIFY COLUMN `base_unit_price_in_cents` bigint NOT NULL;
--> statement-breakpoint

ALTER TABLE `modifier_options`
ADD CONSTRAINT `modifier_options_company_id_companies_id_fk`
FOREIGN KEY (`company_id`)
REFERENCES `companies`(`id`)
ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `product_modifier_groups`
ADD CONSTRAINT `product_modifier_groups_company_id_companies_id_fk`
FOREIGN KEY (`company_id`)
REFERENCES `companies`(`id`)
ON DELETE no action ON UPDATE no action;
--> statement-breakpoint


ALTER TABLE `modifier_groups` ADD CONSTRAINT `modifier_groups_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `modifier_options` ADD CONSTRAINT `modifier_options_group_id_modifier_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `modifier_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_item_modifiers` ADD CONSTRAINT `order_item_modifiers_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_item_modifiers` ADD CONSTRAINT `order_item_modifiers_order_item_id_order_items_id_fk` FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_item_modifiers` ADD CONSTRAINT `order_item_modifiers_modifier_group_id_modifier_groups_id_fk` FOREIGN KEY (`modifier_group_id`) REFERENCES `modifier_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_item_modifiers` ADD CONSTRAINT `order_item_modifiers_modifier_option_id_modifier_options_id_fk` FOREIGN KEY (`modifier_option_id`) REFERENCES `modifier_options`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_modifier_groups` ADD CONSTRAINT `product_modifier_groups_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_modifier_groups` ADD CONSTRAINT `product_modifier_groups_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_modifier_groups` ADD CONSTRAINT `product_modifier_groups_group_id_modifier_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `modifier_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `modifier_groups_company_sort_idx` ON `modifier_groups` (`company_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `modifier_options_company_group_idx` ON `modifier_options` (`company_id`,`group_id`);--> statement-breakpoint
CREATE INDEX `order_item_modifiers_company_item_idx` ON `order_item_modifiers` (`company_id`,`order_item_id`);--> statement-breakpoint
CREATE INDEX `order_item_modifiers_group_idx` ON `order_item_modifiers` (`modifier_group_id`);--> statement-breakpoint
CREATE INDEX `order_item_modifiers_option_idx` ON `order_item_modifiers` (`modifier_option_id`);--> statement-breakpoint
CREATE INDEX `product_modifier_groups_company_product_idx` ON `product_modifier_groups` (`company_id`,`product_id`);--> statement-breakpoint
CREATE INDEX `product_modifier_groups_company_group_idx` ON `product_modifier_groups` (`company_id`,`group_id`);--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_base_unit_price_non_negative` CHECK (`order_items`.`base_unit_price_in_cents` >= 0);