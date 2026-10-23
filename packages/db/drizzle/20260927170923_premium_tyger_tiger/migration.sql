ALTER TABLE `BHRankedQueue` RENAME COLUMN `name` TO `name_one`;--> statement-breakpoint
ALTER TABLE `BHRankedQueue` ADD `name_two` text;