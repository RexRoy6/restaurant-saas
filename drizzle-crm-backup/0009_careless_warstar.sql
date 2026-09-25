CREATE TABLE `payment_items` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`payment_id` bigint NOT NULL,
	`contract_item_id` bigint NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	CONSTRAINT `payment_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `payment_items` ADD CONSTRAINT `payment_items_payment_id_payments_id_fk` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_items` ADD CONSTRAINT `payment_items_contract_item_id_contract_items_id_fk` FOREIGN KEY (`contract_item_id`) REFERENCES `contract_items`(`id`) ON DELETE cascade ON UPDATE no action;