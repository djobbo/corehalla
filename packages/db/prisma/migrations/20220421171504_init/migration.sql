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
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("userId","type","id")
);

-- CreateTable
CREATE TABLE "UserConnection" (
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserConnection_pkey" PRIMARY KEY ("userId","type","appId")
);

-- CreateTable
CREATE TABLE "BHPlayer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BHPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BHPlayerAlias" (
    "playerId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,

    CONSTRAINT "BHPlayerAlias_pkey" PRIMARY KEY ("playerId","alias")
);

-- CreateTable
CREATE TABLE "BHClan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created" INTEGER NOT NULL,
    "xp" TEXT NOT NULL,

    CONSTRAINT "BHClan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConnection" ADD CONSTRAINT "UserConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BHPlayerAlias" ADD CONSTRAINT "BHPlayerAlias_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "BHPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
