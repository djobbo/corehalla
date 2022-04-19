-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL DEFAULT E'',
    "avatar_url" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorites" (
    "type" TEXT NOT NULL,
    "favorite_id" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "user_id" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "user_connections" (
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "public" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_favorites_user_id_type_favorite_id_key" ON "user_favorites"("user_id", "type", "favorite_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_connections_user_id_type_app_id_key" ON "user_connections"("user_id", "type", "app_id");

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
