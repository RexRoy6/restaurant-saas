ALTER TABLE `payments` ADD `paid_at` datetime;--> statement-breakpoint
ALTER TABLE `payments` ADD `ticket_number` varchar(100);--> statement-breakpoint
CREATE INDEX `payments_contract_idx` ON `payments` (`contract_id`);--> statement-breakpoint
CREATE INDEX `payments_ticket_idx` ON `payments` (`ticket_number`);