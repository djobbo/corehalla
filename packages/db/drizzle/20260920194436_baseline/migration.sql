CREATE TABLE "BHClan" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"created" integer DEFAULT -1,
	"xp" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BHPlayerAlias" (
	"playerId" text,
	"alias" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"public" boolean DEFAULT true NOT NULL,
	CONSTRAINT "BHPlayerAlias_pkey" PRIMARY KEY("playerId","alias")
);
--> statement-breakpoint
CREATE TABLE "BHPlayerData" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"lastUpdated" timestamp(3) NOT NULL,
	"xp" integer NOT NULL,
	"level" integer NOT NULL,
	"tier" text NOT NULL,
	"games" integer NOT NULL,
	"wins" integer NOT NULL,
	"rating" integer NOT NULL,
	"peakRating" integer NOT NULL,
	"rankedGames" integer NOT NULL,
	"rankedWins" integer NOT NULL,
	"region" text NOT NULL,
	"damageDealt" integer NOT NULL,
	"damageTaken" integer NOT NULL,
	"kos" integer NOT NULL,
	"falls" integer NOT NULL,
	"suicides" integer NOT NULL,
	"teamKos" integer NOT NULL,
	"matchTime" integer NOT NULL,
	"damageUnarmed" integer NOT NULL,
	"koUnarmed" integer NOT NULL,
	"matchTimeUnarmed" integer NOT NULL,
	"koThrownItem" integer NOT NULL,
	"damageThrownItem" integer NOT NULL,
	"koGadgets" integer NOT NULL,
	"damageGadgets" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BHPlayerLegend" (
	"player_id" text,
	"lastUpdated" timestamp(3) NOT NULL,
	"legend_id" integer,
	"damageDealt" integer NOT NULL,
	"damageTaken" integer NOT NULL,
	"kos" integer NOT NULL,
	"falls" integer NOT NULL,
	"suicides" integer NOT NULL,
	"teamKos" integer NOT NULL,
	"matchTime" integer NOT NULL,
	"games" integer NOT NULL,
	"wins" integer NOT NULL,
	"damageUnarmed" integer NOT NULL,
	"damageThrownItem" integer NOT NULL,
	"damageWeaponOne" integer NOT NULL,
	"damageWeaponTwo" integer NOT NULL,
	"damageGadgets" integer NOT NULL,
	"koUnarmed" integer NOT NULL,
	"koThrownItem" integer NOT NULL,
	"koWeaponOne" integer NOT NULL,
	"koWeaponTwo" integer NOT NULL,
	"koGadgets" integer NOT NULL,
	"timeHeldWeaponOne" integer NOT NULL,
	"timeHeldWeaponTwo" integer NOT NULL,
	"xp" integer NOT NULL,
	"level" integer NOT NULL,
	CONSTRAINT "BHPlayerLegend_pkey" PRIMARY KEY("player_id","legend_id")
);
--> statement-breakpoint
CREATE TABLE "BHPlayerWeapon" (
	"player_id" text,
	"lastUpdated" timestamp(3) NOT NULL,
	"weapon_name" text,
	"kos" integer NOT NULL,
	"matchTime" integer NOT NULL,
	"games" integer NOT NULL,
	"wins" integer NOT NULL,
	"damageDealt" integer NOT NULL,
	"xp" integer NOT NULL,
	"level" integer NOT NULL,
	CONSTRAINT "BHPlayerWeapon_pkey" PRIMARY KEY("player_id","weapon_name")
);
--> statement-breakpoint
CREATE TABLE "CrawlProgress" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"lastUpdated" timestamp(3) NOT NULL,
	"progress" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserConnection" (
	"userId" uuid,
	"type" text,
	"appId" text,
	"name" text NOT NULL,
	"verified" boolean NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	CONSTRAINT "UserConnection_pkey" PRIMARY KEY("userId","type","appId")
);
--> statement-breakpoint
CREATE TABLE "UserFavorite" (
	"type" text,
	"id" text,
	"name" text NOT NULL,
	"meta" jsonb NOT NULL,
	"userId" uuid,
	CONSTRAINT "UserFavorite_pkey" PRIMARY KEY("userId","type","id")
);
--> statement-breakpoint
CREATE TABLE "UserProfile" (
	"id" uuid PRIMARY KEY,
	"username" text DEFAULT '' NOT NULL,
	"avatarUrl" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "BHPlayerLegend" ADD CONSTRAINT "BHPlayerLegend_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "BHPlayerData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "BHPlayerWeapon" ADD CONSTRAINT "BHPlayerWeapon_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "BHPlayerData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "UserConnection" ADD CONSTRAINT "UserConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;