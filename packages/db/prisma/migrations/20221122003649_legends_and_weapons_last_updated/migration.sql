/*
  Warnings:

  - Added the required column `lastUpdated` to the `BHPlayerLegend` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdated` to the `BHPlayerWeapon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BHPlayerLegend" ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "BHPlayerWeapon" ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL;
