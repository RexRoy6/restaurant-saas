ALTER TABLE `payments` ADD `idempotency_key` varchar(64);--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_idempotency_key_unique` UNIQUE(`idempotency_key`);