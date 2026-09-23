CREATE TABLE `BHClan` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`created` integer DEFAULT -1,
	`xp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `BHPlayerAlias` (
	`playerId` text NOT NULL,
	`alias` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`public` integer DEFAULT true NOT NULL,
	CONSTRAINT `BHPlayerAlias_pkey` PRIMARY KEY(`playerId`, `alias`)
);
--> statement-breakpoint
CREATE TABLE `BHPlayerData` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`lastUpdated` integer NOT NULL,
	`xp` integer NOT NULL,
	`level` integer NOT NULL,
	`tier` text NOT NULL,
	`games` integer NOT NULL,
	`wins` integer NOT NULL,
	`rating` integer NOT NULL,
	`peakRating` integer NOT NULL,
	`rankedGames` integer NOT NULL,
	`rankedWins` integer NOT NULL,
	`region` text NOT NULL,
	`damageDealt` integer NOT NULL,
	`damageTaken` integer NOT NULL,
	`kos` integer NOT NULL,
	`falls` integer NOT NULL,
	`suicides` integer NOT NULL,
	`teamKos` integer NOT NULL,
	`matchTime` integer NOT NULL,
	`damageUnarmed` integer NOT NULL,
	`koUnarmed` integer NOT NULL,
	`matchTimeUnarmed` integer NOT NULL,
	`koThrownItem` integer NOT NULL,
	`damageThrownItem` integer NOT NULL,
	`koGadgets` integer NOT NULL,
	`damageGadgets` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `BHPlayerLegend` (
	`player_id` text NOT NULL,
	`lastUpdated` integer NOT NULL,
	`legend_id` integer NOT NULL,
	`damageDealt` integer NOT NULL,
	`damageTaken` integer NOT NULL,
	`kos` integer NOT NULL,
	`falls` integer NOT NULL,
	`suicides` integer NOT NULL,
	`teamKos` integer NOT NULL,
	`matchTime` integer NOT NULL,
	`games` integer NOT NULL,
	`wins` integer NOT NULL,
	`damageUnarmed` integer NOT NULL,
	`damageThrownItem` integer NOT NULL,
	`damageWeaponOne` integer NOT NULL,
	`damageWeaponTwo` integer NOT NULL,
	`damageGadgets` integer NOT NULL,
	`koUnarmed` integer NOT NULL,
	`koThrownItem` integer NOT NULL,
	`koWeaponOne` integer NOT NULL,
	`koWeaponTwo` integer NOT NULL,
	`koGadgets` integer NOT NULL,
	`timeHeldWeaponOne` integer NOT NULL,
	`timeHeldWeaponTwo` integer NOT NULL,
	`xp` integer NOT NULL,
	`level` integer NOT NULL,
	CONSTRAINT `BHPlayerLegend_pkey` PRIMARY KEY(`player_id`, `legend_id`),
	CONSTRAINT `BHPlayerLegend_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `BHPlayerData`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `BHPlayerWeapon` (
	`player_id` text NOT NULL,
	`lastUpdated` integer NOT NULL,
	`weapon_name` text NOT NULL,
	`kos` integer NOT NULL,
	`matchTime` integer NOT NULL,
	`games` integer NOT NULL,
	`wins` integer NOT NULL,
	`damageDealt` integer NOT NULL,
	`xp` integer NOT NULL,
	`level` integer NOT NULL,
	CONSTRAINT `BHPlayerWeapon_pkey` PRIMARY KEY(`player_id`, `weapon_name`),
	CONSTRAINT `BHPlayerWeapon_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `BHPlayerData`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `CrawlProgress` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`lastUpdated` integer NOT NULL,
	`progress` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `UserConnection` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`appId` text NOT NULL,
	`name` text NOT NULL,
	`verified` integer NOT NULL,
	`public` integer DEFAULT false NOT NULL,
	CONSTRAINT `UserConnection_pkey` PRIMARY KEY(`userId`, `type`, `appId`),
	CONSTRAINT `UserConnection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserProfile`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `UserFavorite` (
	`type` text NOT NULL,
	`id` text NOT NULL,
	`name` text NOT NULL,
	`meta` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `UserFavorite_pkey` PRIMARY KEY(`userId`, `type`, `id`),
	CONSTRAINT `UserFavorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserProfile`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `UserProfile` (
	`id` text PRIMARY KEY,
	`discordId` text,
	`username` text DEFAULT '' NOT NULL,
	`avatarUrl` text DEFAULT '' NOT NULL,
	`email` text,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `UserSession` (
	`id` text PRIMARY KEY,
	`userId` text NOT NULL,
	`discordAccessToken` text NOT NULL,
	`discordRefreshToken` text,
	`discordTokenExpiresAt` integer NOT NULL,
	`scope` text DEFAULT '' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`expiresAt` integer NOT NULL,
	`lastSeenAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT `UserSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserProfile`(`id`) ON UPDATE CASCADE ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `BHClan_xp_idx` ON `BHClan` (`xp`);--> statement-breakpoint
CREATE INDEX `BHClan_name_nocase_idx` ON `BHClan` ("name" COLLATE NOCASE);--> statement-breakpoint
CREATE INDEX `BHPlayerAlias_alias_nocase_idx` ON `BHPlayerAlias` ("alias" COLLATE NOCASE);--> statement-breakpoint
CREATE INDEX `BHPlayerAlias_createdAt_idx` ON `BHPlayerAlias` (`createdAt`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_xp_idx` ON `BHPlayerData` (`xp`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_games_idx` ON `BHPlayerData` (`games`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_wins_idx` ON `BHPlayerData` (`wins`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_rankedGames_idx` ON `BHPlayerData` (`rankedGames`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_rankedWins_idx` ON `BHPlayerData` (`rankedWins`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_damageDealt_idx` ON `BHPlayerData` (`damageDealt`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_damageTaken_idx` ON `BHPlayerData` (`damageTaken`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_kos_idx` ON `BHPlayerData` (`kos`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_falls_idx` ON `BHPlayerData` (`falls`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_suicides_idx` ON `BHPlayerData` (`suicides`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_teamKos_idx` ON `BHPlayerData` (`teamKos`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_matchTime_idx` ON `BHPlayerData` (`matchTime`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_damageUnarmed_idx` ON `BHPlayerData` (`damageUnarmed`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_koUnarmed_idx` ON `BHPlayerData` (`koUnarmed`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_matchTimeUnarmed_idx` ON `BHPlayerData` (`matchTimeUnarmed`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_koThrownItem_idx` ON `BHPlayerData` (`koThrownItem`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_damageThrownItem_idx` ON `BHPlayerData` (`damageThrownItem`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_koGadgets_idx` ON `BHPlayerData` (`koGadgets`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_damageGadgets_idx` ON `BHPlayerData` (`damageGadgets`);--> statement-breakpoint
CREATE INDEX `BHPlayerData_lastUpdated_idx` ON `BHPlayerData` (`lastUpdated`);--> statement-breakpoint
CREATE UNIQUE INDEX `UserProfile_discordId_key` ON `UserProfile` (`discordId`);