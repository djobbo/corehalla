/*
  Warnings:

  - You are about to drop the `BHPlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "BHPlayer";

-- CreateTable
CREATE TABLE "BHPlayerData" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "xp" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "peakRating" INTEGER NOT NULL,
    "rankedGames" INTEGER NOT NULL,
    "rankedWins" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "damageDealt" INTEGER NOT NULL,
    "damageTaken" INTEGER NOT NULL,
    "kos" INTEGER NOT NULL,
    "falls" INTEGER NOT NULL,
    "suicides" INTEGER NOT NULL,
    "teamKos" INTEGER NOT NULL,
    "matchTime" INTEGER NOT NULL,
    "damageUnarmed" INTEGER NOT NULL,
    "damageThrownItem" INTEGER NOT NULL,
    "damageGadgets" INTEGER NOT NULL,
    "koUnarmed" INTEGER NOT NULL,
    "koThrownItem" INTEGER NOT NULL,
    "koGadgets" INTEGER NOT NULL,

    CONSTRAINT "BHPlayerData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BHPlayerLegend" (
    "player_id" TEXT NOT NULL,
    "legend_id" INTEGER NOT NULL,
    "damageDealt" INTEGER NOT NULL,
    "damageTaken" INTEGER NOT NULL,
    "kos" INTEGER NOT NULL,
    "falls" INTEGER NOT NULL,
    "suicides" INTEGER NOT NULL,
    "teamKos" INTEGER NOT NULL,
    "matchTime" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "damageUnarmed" INTEGER NOT NULL,
    "damageThrownItem" INTEGER NOT NULL,
    "damageWeaponOne" INTEGER NOT NULL,
    "damageWeaponTwo" INTEGER NOT NULL,
    "damageGadgets" INTEGER NOT NULL,
    "koUnarmed" INTEGER NOT NULL,
    "koThrownItem" INTEGER NOT NULL,
    "koWeaponOne" INTEGER NOT NULL,
    "koWeaponTwo" INTEGER NOT NULL,
    "koGadgets" INTEGER NOT NULL,
    "timeHeldWeaponOne" INTEGER NOT NULL,
    "timeHeldWeaponTwo" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "BHPlayerLegend_pkey" PRIMARY KEY ("player_id","legend_id")
);

-- CreateTable
CREATE TABLE "BHPlayerWeapon" (
    "player_id" TEXT NOT NULL,
    "weapon_name" TEXT NOT NULL,
    "kos" INTEGER NOT NULL,
    "matchTime" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "damageDealt" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "BHPlayerWeapon_pkey" PRIMARY KEY ("player_id","weapon_name")
);

-- CreateTable
CREATE TABLE "CrawlProgress" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL,

    CONSTRAINT "CrawlProgress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BHPlayerLegend" ADD CONSTRAINT "BHPlayerLegend_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "BHPlayerData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BHPlayerWeapon" ADD CONSTRAINT "BHPlayerWeapon_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "BHPlayerData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
