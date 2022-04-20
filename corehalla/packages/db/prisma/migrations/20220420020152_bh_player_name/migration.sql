/*
  Warnings:

  - Added the required column `name` to the `BHPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BHPlayer" ADD COLUMN     "name" TEXT NOT NULL;
