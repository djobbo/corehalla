-- AlterTable
ALTER TABLE "BHClan" ALTER COLUMN "created" DROP NOT NULL,
ALTER COLUMN "created" SET DEFAULT -1;
