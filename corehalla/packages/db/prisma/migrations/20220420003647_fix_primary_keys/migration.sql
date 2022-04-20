-- DropIndex
DROP INDEX "UserConnection_userId_type_appId_key";

-- DropIndex
DROP INDEX "UserFavorite_userId_type_favoriteId_key";

-- AlterTable
ALTER TABLE "UserConnection" ADD CONSTRAINT "UserConnection_pkey" PRIMARY KEY ("userId", "type", "appId");

-- AlterTable
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("userId", "type", "favoriteId");
