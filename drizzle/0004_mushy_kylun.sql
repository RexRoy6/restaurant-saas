CREATE TABLE `company_business_hours` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`day_of_week` bigint NOT NULL,
	`is_closed` boolean NOT NULL DEFAULT true,
	`opens_at` varchar(5),
	`closes_at` varchar(5),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `company_business_hours_id` PRIMARY KEY(`id`),
	CONSTRAINT `company_business_hours_company_day_unique` UNIQUE(`company_id`,`day_of_week`),
	CONSTRAINT `company_business_hours_day_range` CHECK(`company_business_hours`.`day_of_week` BETWEEN 0 AND 6),
	CONSTRAINT `company_business_hours_consistency` CHECK((
        (`company_business_hours`.`is_closed` = true
          AND `company_business_hours`.`opens_at` IS NULL
          AND `company_business_hours`.`closes_at` IS NULL)
        OR
        (`company_business_hours`.`is_closed` = false
          AND `company_business_hours`.`opens_at` IS NOT NULL
          AND `company_business_hours`.`closes_at` IS NOT NULL
          AND `company_business_hours`.`opens_at` <> `company_business_hours`.`closes_at`)
      ))
);
--> statement-breakpoint
CREATE TABLE `company_public_info` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`company_id` bigint NOT NULL,
	`google_maps_url` varchar(2048),
	`is_temporarily_closed` boolean NOT NULL DEFAULT false,
	`temporary_closure_reason` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `company_public_info_id` PRIMARY KEY(`id`),
	CONSTRAINT `company_public_info_company_unique` UNIQUE(`company_id`)
);
--> statement-breakpoint
ALTER TABLE `company_business_hours` ADD CONSTRAINT `company_business_hours_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_public_info` ADD CONSTRAINT `company_public_info_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;