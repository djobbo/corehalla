ALTER TABLE `BHRankedQueue` ADD `rank` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `BHRankedQueue` ADD `ratingDelta` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `BHRankedQueue` ADD `rankDelta` integer DEFAULT 0 NOT NULL;