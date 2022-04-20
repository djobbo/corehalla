/*
  Warnings:

  - The primary key for the `UserFavorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `type` on the `UserFavorite` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserFavoriteType" AS ENUM ('PLAYER', 'CLAN');

-- AlterTable
ALTER TABLE "UserFavorite" DROP CONSTRAINT "UserFavorite_pkey",
DROP COLUMN "type",
ADD COLUMN     "type" "UserFavoriteType" NOT NULL,
ADD CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("userId", "type", "id");
