-- AlterTable
ALTER TABLE "BHClan"
ALTER COLUMN "xp" TYPE INT 
USING "xp"::integer;