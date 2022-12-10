/*
  Warnings:

  - You are about to drop the column `rank` on the `BHPlayerData` table. All the data in the column will be lost.
  - Added the required column `matchTimeUnarmed` to the `BHPlayerData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BHPlayerData" DROP COLUMN "rank",
ADD COLUMN     "matchTimeUnarmed" INTEGER NOT NULL;
