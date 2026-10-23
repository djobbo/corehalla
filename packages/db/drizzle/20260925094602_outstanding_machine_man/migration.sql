ALTER TABLE `BHClan` ADD `nameLower` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `BHPlayerAlias` ADD `aliasLower` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `BHPlayerAlias` ADD `lastSeen` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `BHClan` SET `nameLower` = lower("name") WHERE `nameLower` = '';--> statement-breakpoint
UPDATE `BHPlayerAlias` SET `aliasLower` = lower("alias") WHERE `aliasLower` = '';--> statement-breakpoint
UPDATE `BHPlayerAlias` SET `lastSeen` = "createdAt" WHERE `lastSeen` = 0;--> statement-breakpoint
DROP INDEX IF EXISTS `BHClan_name_nocase_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `BHPlayerAlias_alias_nocase_idx`;--> statement-breakpoint
CREATE INDEX `BHClan_nameLower_idx` ON `BHClan` (`nameLower`);--> statement-breakpoint
CREATE INDEX `BHPlayerAlias_aliasLower_idx` ON `BHPlayerAlias` (`aliasLower`);--> statement-breakpoint
CREATE INDEX `BHPlayerAlias_lastSeen_idx` ON `BHPlayerAlias` (`lastSeen`);