-- CreateTable
CREATE TABLE "BHPlayer" (
    "id" TEXT NOT NULL,

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

    CONSTRAINT "BHClan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BHPlayerAlias" ADD CONSTRAINT "BHPlayerAlias_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "BHPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
