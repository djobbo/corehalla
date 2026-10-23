ALTER TABLE `BHRankedQueue` RENAME COLUMN `player_id` TO `entry_id`;--> statement-breakpoint
ALTER TABLE `BHRankedQueue` ADD `member_one_id` text;--> statement-breakpoint
ALTER TABLE `BHRankedQueue` ADD `member_two_id` text;