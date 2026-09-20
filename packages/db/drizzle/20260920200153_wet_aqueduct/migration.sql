CREATE TABLE "UserSession" (
	"id" text PRIMARY KEY,
	"userId" uuid NOT NULL,
	"discordAccessToken" text NOT NULL,
	"discordRefreshToken" text,
	"discordTokenExpiresAt" timestamp(3) NOT NULL,
	"scope" text DEFAULT '' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expiresAt" timestamp(3) NOT NULL,
	"lastSeenAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "UserProfile" ADD COLUMN "discordId" text;--> statement-breakpoint
ALTER TABLE "UserProfile" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "UserProfile" ADD COLUMN "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "UserProfile" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_discordId_key" UNIQUE("discordId");--> statement-breakpoint
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;