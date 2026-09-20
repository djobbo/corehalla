import { sql } from "drizzle-orm"
import {
    boolean,
    foreignKey,
    integer,
    jsonb,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core"

/**
 * Database schema.
 *
 * This replaces the previous `schema.prisma`. Table names, column names, SQL
 * types, defaults and constraint names are kept identical to what
 * `prisma migrate` produced, so existing databases need no data migration and
 * `drizzle-kit generate` reports no drift against them.
 *
 * Row types are exported under the same names the Prisma client used
 * (`BHPlayerData`, `UserProfile`, …), so call sites keep their imports.
 */

/** Matches the previous `Prisma.JsonValue`. */
export type JsonObject = { [Key in string]?: JsonValue }
/** Matches the previous `Prisma.JsonArray`. */
export type JsonArray = JsonValue[]
/** Matches the previous `Prisma.JsonValue`. */
export type JsonValue =
    | string
    | number
    | boolean
    | JsonObject
    | JsonArray
    | null

// Prisma applied `@@id`/`@relation` names by convention; they are spelled out
// here so the generated DDL matches the existing databases byte for byte.
const pgRestrict = "restrict" as const
const pgCascade = "cascade" as const

export const userProfile = pgTable(
    "UserProfile",
    {
        // Cross-schema foreign key: auth.users.id -> auth_user_trigger_[add|rm].sql
        id: uuid("id").primaryKey(),
        username: text("username").notNull().default(""),
        avatarUrl: text("avatarUrl").notNull().default(""),
    },
    (table) => [primaryKey({ name: "UserProfile_pkey", columns: [table.id] })],
)

export const userFavorite = pgTable(
    "UserFavorite",
    {
        type: text("type").notNull(),
        id: text("id").notNull(),
        name: text("name").notNull(),
        meta: jsonb("meta").$type<JsonValue>().notNull(),
        userId: uuid("userId").notNull(),
    },
    (table) => [
        primaryKey({
            name: "UserFavorite_pkey",
            columns: [table.userId, table.type, table.id],
        }),
        foreignKey({
            name: "UserFavorite_userId_fkey",
            columns: [table.userId],
            foreignColumns: [userProfile.id],
        })
            .onDelete(pgRestrict)
            .onUpdate(pgCascade),
    ],
)

export const userConnection = pgTable(
    "UserConnection",
    {
        userId: uuid("userId").notNull(),
        type: text("type").notNull(),
        appId: text("appId").notNull(),
        name: text("name").notNull(),
        verified: boolean("verified").notNull(),
        public: boolean("public").notNull().default(false),
    },
    (table) => [
        primaryKey({
            name: "UserConnection_pkey",
            columns: [table.userId, table.type, table.appId],
        }),
        foreignKey({
            name: "UserConnection_userId_fkey",
            columns: [table.userId],
            foreignColumns: [userProfile.id],
        })
            .onDelete(pgRestrict)
            .onUpdate(pgCascade),
    ],
)

export const bhPlayerData = pgTable(
    "BHPlayerData",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        lastUpdated: timestamp("lastUpdated", { precision: 3 }).notNull(),
        xp: integer("xp").notNull(),
        level: integer("level").notNull(),
        tier: text("tier").notNull(),
        games: integer("games").notNull(),
        wins: integer("wins").notNull(),
        rating: integer("rating").notNull(),
        peakRating: integer("peakRating").notNull(),
        rankedGames: integer("rankedGames").notNull(),
        rankedWins: integer("rankedWins").notNull(),
        region: text("region").notNull(),
        damageDealt: integer("damageDealt").notNull(),
        damageTaken: integer("damageTaken").notNull(),
        kos: integer("kos").notNull(),
        falls: integer("falls").notNull(),
        suicides: integer("suicides").notNull(),
        teamKos: integer("teamKos").notNull(),
        matchTime: integer("matchTime").notNull(),
        damageUnarmed: integer("damageUnarmed").notNull(),
        koUnarmed: integer("koUnarmed").notNull(),
        matchTimeUnarmed: integer("matchTimeUnarmed").notNull(),
        koThrownItem: integer("koThrownItem").notNull(),
        damageThrownItem: integer("damageThrownItem").notNull(),
        koGadgets: integer("koGadgets").notNull(),
        damageGadgets: integer("damageGadgets").notNull(),
    },
    (table) => [primaryKey({ name: "BHPlayerData_pkey", columns: [table.id] })],
)

export const bhPlayerLegend = pgTable(
    "BHPlayerLegend",
    {
        player_id: text("player_id").notNull(),
        lastUpdated: timestamp("lastUpdated", { precision: 3 }).notNull(),
        legend_id: integer("legend_id").notNull(),
        damageDealt: integer("damageDealt").notNull(),
        damageTaken: integer("damageTaken").notNull(),
        kos: integer("kos").notNull(),
        falls: integer("falls").notNull(),
        suicides: integer("suicides").notNull(),
        teamKos: integer("teamKos").notNull(),
        matchTime: integer("matchTime").notNull(),
        games: integer("games").notNull(),
        wins: integer("wins").notNull(),
        damageUnarmed: integer("damageUnarmed").notNull(),
        damageThrownItem: integer("damageThrownItem").notNull(),
        damageWeaponOne: integer("damageWeaponOne").notNull(),
        damageWeaponTwo: integer("damageWeaponTwo").notNull(),
        damageGadgets: integer("damageGadgets").notNull(),
        koUnarmed: integer("koUnarmed").notNull(),
        koThrownItem: integer("koThrownItem").notNull(),
        koWeaponOne: integer("koWeaponOne").notNull(),
        koWeaponTwo: integer("koWeaponTwo").notNull(),
        koGadgets: integer("koGadgets").notNull(),
        timeHeldWeaponOne: integer("timeHeldWeaponOne").notNull(),
        timeHeldWeaponTwo: integer("timeHeldWeaponTwo").notNull(),
        xp: integer("xp").notNull(),
        level: integer("level").notNull(),
    },
    (table) => [
        primaryKey({
            name: "BHPlayerLegend_pkey",
            columns: [table.player_id, table.legend_id],
        }),
        foreignKey({
            name: "BHPlayerLegend_player_id_fkey",
            columns: [table.player_id],
            foreignColumns: [bhPlayerData.id],
        })
            .onDelete(pgRestrict)
            .onUpdate(pgCascade),
    ],
)

export const bhPlayerWeapon = pgTable(
    "BHPlayerWeapon",
    {
        player_id: text("player_id").notNull(),
        lastUpdated: timestamp("lastUpdated", { precision: 3 }).notNull(),
        weapon_name: text("weapon_name").notNull(),
        kos: integer("kos").notNull(),
        matchTime: integer("matchTime").notNull(),
        games: integer("games").notNull(),
        wins: integer("wins").notNull(),
        damageDealt: integer("damageDealt").notNull(),
        xp: integer("xp").notNull(),
        level: integer("level").notNull(),
    },
    (table) => [
        primaryKey({
            name: "BHPlayerWeapon_pkey",
            columns: [table.player_id, table.weapon_name],
        }),
        foreignKey({
            name: "BHPlayerWeapon_player_id_fkey",
            columns: [table.player_id],
            foreignColumns: [bhPlayerData.id],
        })
            .onDelete(pgRestrict)
            .onUpdate(pgCascade),
    ],
)

export const bhPlayerAlias = pgTable(
    "BHPlayerAlias",
    {
        playerId: text("playerId").notNull(),
        alias: text("alias").notNull(),
        // Spelled as `CURRENT_TIMESTAMP` (not `now()`) to match the default
        // Prisma created, so introspection reports no drift.
        createdAt: timestamp("createdAt", { precision: 3 })
            .notNull()
            .default(sql`CURRENT_TIMESTAMP`),
        public: boolean("public").notNull().default(true),
    },
    (table) => [
        primaryKey({
            name: "BHPlayerAlias_pkey",
            columns: [table.playerId, table.alias],
        }),
    ],
)

export const bhClan = pgTable(
    "BHClan",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        created: integer("created").default(-1),
        xp: integer("xp").notNull(),
    },
    (table) => [primaryKey({ name: "BHClan_pkey", columns: [table.id] })],
)

export const crawlProgress = pgTable(
    "CrawlProgress",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        lastUpdated: timestamp("lastUpdated", { precision: 3 }).notNull(),
        progress: integer("progress").notNull(),
    },
    (table) => [
        primaryKey({ name: "CrawlProgress_pkey", columns: [table.id] }),
    ],
)

// --- row types --------------------------------------------------------------
//
// Same names the Prisma client exported, so existing imports keep working.

export type UserProfile = typeof userProfile.$inferSelect
export type UserFavorite = typeof userFavorite.$inferSelect
export type UserConnection = typeof userConnection.$inferSelect
export type BHPlayerData = typeof bhPlayerData.$inferSelect
export type BHPlayerLegend = typeof bhPlayerLegend.$inferSelect
export type BHPlayerWeapon = typeof bhPlayerWeapon.$inferSelect
export type BHPlayerAlias = typeof bhPlayerAlias.$inferSelect
export type BHClan = typeof bhClan.$inferSelect
export type CrawlProgress = typeof crawlProgress.$inferSelect

// --- insert types -----------------------------------------------------------

export type NewUserProfile = typeof userProfile.$inferInsert
export type NewUserFavorite = typeof userFavorite.$inferInsert
export type NewUserConnection = typeof userConnection.$inferInsert
export type NewBHPlayerData = typeof bhPlayerData.$inferInsert
export type NewBHPlayerLegend = typeof bhPlayerLegend.$inferInsert
export type NewBHPlayerWeapon = typeof bhPlayerWeapon.$inferInsert
export type NewBHPlayerAlias = typeof bhPlayerAlias.$inferInsert
export type NewBHClan = typeof bhClan.$inferInsert
export type NewCrawlProgress = typeof crawlProgress.$inferInsert
