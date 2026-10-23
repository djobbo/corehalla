CREATE TABLE `BHRankedQueue` (
	`player_id` text NOT NULL,
	`bracket` text NOT NULL,
	`region` text NOT NULL,
	`name` text NOT NULL,
	`lastUpdated` integer NOT NULL,
	`rating` integer NOT NULL,
	`peakRating` integer NOT NULL,
	`tier` text NOT NULL,
	`games` integer NOT NULL,
	`wins` integer NOT NULL,
	`queuedAt` integer,
	CONSTRAINT `BHRankedQueue_pkey` PRIMARY KEY(`player_id`, `bracket`)
);
--> statement-breakpoint
CREATE INDEX `BHRankedQueue_ladder_idx` ON `BHRankedQueue` (`bracket`,`region`,`queuedAt`);