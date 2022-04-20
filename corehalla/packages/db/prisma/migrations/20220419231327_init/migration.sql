-- CreateTable
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL DEFAULT E'',
    "avatarUrl" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavorite" (
    "type" TEXT NOT NULL,
    "favoriteId" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "userId" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "UserConnection" (
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "public" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFavorite_userId_type_favoriteId_key" ON "UserFavorite"("userId", "type", "favoriteId");

-- CreateIndex
CREATE UNIQUE INDEX "UserConnection_userId_type_appId_key" ON "UserConnection"("userId", "type", "appId");

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConnection" ADD CONSTRAINT "UserConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
