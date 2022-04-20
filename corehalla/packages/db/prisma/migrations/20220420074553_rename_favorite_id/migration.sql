/*
  Warnings:

  - The primary key for the `UserFavorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `favoriteId` on the `UserFavorite` table. All the data in the column will be lost.
  - Added the required column `id` to the `UserFavorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `UserFavorite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserFavorite" DROP CONSTRAINT "UserFavorite_pkey";

ALTER TABLE "UserFavorite"
RENAME COLUMN "favoriteId" TO "id";

ALTER TABLE "UserFavorite"
ADD COLUMN      "name" TEXT NOT NULL,
ADD CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("userId", "type", "id");
