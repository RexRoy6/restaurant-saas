-- Custom SQL migration file, put your code below! --
ALTER TABLE `modifier_options`
ADD CONSTRAINT `modifier_options_company_id_companies_id_fk`
FOREIGN KEY (`company_id`)
REFERENCES `companies`(`id`)
ON DELETE no action
ON UPDATE no action;