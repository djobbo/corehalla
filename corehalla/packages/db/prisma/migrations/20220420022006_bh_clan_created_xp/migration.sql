/*
  Warnings:

  - Added the required column `created` to the `BHClan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xp` to the `BHClan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BHClan" ADD COLUMN     "created" INTEGER NOT NULL,
ADD COLUMN     "xp" TEXT NOT NULL;
