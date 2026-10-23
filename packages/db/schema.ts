import { sql } from "drizzle-orm"
import {
    foreignKey,
    index,
    integer,
    primaryKey,
    sqliteTable,
    text,
    uniqueIndex,
} from "drizzle-orm/sqlite-core"

/**
 * Prefix search uses dedicated lowercase columns (`aliasLower`/`nameLower`),
 * not `COLLATE NOCASE` (ASCII-only). Search queries order by the searched
 * column itself so SQLite does not fall back to a temp B-tree sort.
 */

export type JsonObject = { [Key in string]?: JsonValue }
export type JsonArray = JsonValue[]
export type JsonValue =
    | string
    | number
    | boolean
    | JsonObject
    | JsonArray
    | null

const now = sql`(unixepoch() * 1000)`

/** Sort columns for `getGlobalPlayerRankings` (one index each). */
const playerRankingColumns = [
    "xp",
    "games",
    "wins",
    "rankedGames",
    "rankedWins",
    "damageDealt",
    "damageTaken",
    "kos",
    "falls",
    "suicides",
    "teamKos",
    "matchTime",
    "damageUnarmed",
    "koUnarmed",
    "matchTimeUnarmed",
    "koThrownItem",
    "damageThrownItem",
    "koGadgets",
    "damageGadgets",
] as const

export const userProfile = sqliteTable(
    "UserProfile",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        /** Nullable: pre-auth rows have none until the user signs in again. */
        discordId: text("discordId"),
        username: text("username").notNull().default(""),
        avatarUrl: text("avatarUrl").notNull().default(""),
        email: text("email"),
        createdAt: integer("createdAt", { mode: "timestamp_ms" })
            .notNull()
            .default(now),
    },
    (table) => [uniqueIndex("UserProfile_discordId_key").on(table.discordId)],
)

/** `id` is SHA-256 of the cookie token — a DB leak cannot be replayed as a login. */
export const userSession = sqliteTable(
    "UserSession",
    {
        id: text("id").primaryKey(),
        userId: text("userId").notNull(),
        discordAccessToken: text("discordAccessToken").notNull(),
        discordRefreshToken: text("discordRefreshToken"),
        discordTokenExpiresAt: integer("discordTokenExpiresAt", {
            mode: "timestamp_ms",
        }).notNull(),
        scope: text("scope").notNull().default(""),
        createdAt: integer("createdAt", { mode: "timestamp_ms" })
            .notNull()
            .default(now),
        expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
        lastSeenAt: integer("lastSeenAt", { mode: "timestamp_ms" })
            .notNull()
            .default(now),
    },
    (table) => [
        foreignKey({
            name: "UserSession_userId_fkey",
            columns: [table.userId],
            foreignColumns: [userProfile.id],
        })
            .onDelete("cascade")
            .onUpdate("cascade"),
    ],
)

export const userFavorite = sqliteTable(
    "UserFavorite",
    {
        type: text("type").notNull(),
        id: text("id").notNull(),
        name: text("name").notNull(),
        meta: text("meta", { mode: "json" }).$type<JsonValue>().notNull(),
        userId: text("userId").notNull(),
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
            .onDelete("restrict")
            .onUpdate("cascade"),
    ],
)

export const userConnection = sqliteTable(
    "UserConnection",
    {
        userId: text("userId").notNull(),
        type: text("type").notNull(),
        appId: text("appId").notNull(),
        name: text("name").notNull(),
        verified: integer("verified", { mode: "boolean" }).notNull(),
        public: integer("public", { mode: "boolean" }).notNull().default(false),
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
            .onDelete("restrict")
            .onUpdate("cascade"),
    ],
)

export const bhPlayerData = sqliteTable(
    "BHPlayerData",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        lastUpdated: integer("lastUpdated", { mode: "timestamp_ms" }).notNull(),
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
    (table) => [
        ...playerRankingColumns.map((column) =>
            index(`BHPlayerData_${column}_idx`).on(table[column]),
        ),
        index("BHPlayerData_lastUpdated_idx").on(table.lastUpdated),
    ],
)

export const bhPlayerLegend = sqliteTable(
    "BHPlayerLegend",
    {
        player_id: text("player_id").notNull(),
        lastUpdated: integer("lastUpdated", { mode: "timestamp_ms" }).notNull(),
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
            .onDelete("restrict")
            .onUpdate("cascade"),
    ],
)

export const bhPlayerWeapon = sqliteTable(
    "BHPlayerWeapon",
    {
        player_id: text("player_id").notNull(),
        lastUpdated: integer("lastUpdated", { mode: "timestamp_ms" }).notNull(),
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
            .onDelete("restrict")
            .onUpdate("cascade"),
    ],
)

/**
 * One row per (ladder entry, bracket). Key by entry (not player) — a 2v2 player
 * can hold several teams. Activity is `games` rising vs the stored value;
 * `queuedAt` null means seen on a ladder but not yet observed playing.
 */
export const bhRankedQueue = sqliteTable(
    "BHRankedQueue",
    {
        /** Solo player id, or `<one>-<two>`; PK cannot use nullable member cols. */
        entry_id: text("entry_id").notNull(),
        /** Part of the key: one entry can sit on three ladders. */
        bracket: text("bracket").notNull(),
        region: text("region").notNull(),
        /** Separate names — never a joined string. `name_two` null on solo. */
        name_one: text("name_one").notNull(),
        name_two: text("name_two"),
        /** Null for a solo ladder. */
        member_one_id: text("member_one_id"),
        member_two_id: text("member_two_id"),
        lastUpdated: integer("lastUpdated", {
            mode: "timestamp_ms",
        }).notNull(),
        rating: integer("rating").notNull(),
        peakRating: integer("peakRating").notNull(),
        tier: text("tier").notNull(),
        games: integer("games").notNull(),
        wins: integer("wins").notNull(),
        rank: integer("rank").notNull().default(0),
        /**
         * Computed from previous row values on a `games` increase; zero on
         * insert (no previous value).
         */
        ratingDelta: integer("ratingDelta").notNull().default(0),
        rankDelta: integer("rankDelta").notNull().default(0),
        /** Null until a `games` increase is observed. */
        queuedAt: integer("queuedAt", { mode: "timestamp_ms" }),
    },
    (table) => [
        primaryKey({
            name: "BHRankedQueue_pkey",
            columns: [table.entry_id, table.bracket],
        }),
        index("BHRankedQueue_ladder_idx").on(
            table.bracket,
            table.region,
            table.queuedAt,
        ),
    ],
)

export const bhPlayerAlias = sqliteTable(
    "BHPlayerAlias",
    {
        playerId: text("playerId").notNull(),
        alias: text("alias").notNull(),
        /** Lowercased in JS by the writer — never SQL `lower()` (non-ASCII). */
        aliasLower: text("aliasLower").notNull().default(""),
        /** Set once on insert; never updated. */
        createdAt: integer("createdAt", { mode: "timestamp_ms" })
            .notNull()
            .default(now),
        /**
         * Default `0`, not `now`: D1 rejects non-constant defaults on
         * `ALTER TABLE ... ADD COLUMN` (local `node:sqlite` accepts them).
         * Writers set this explicitly; migration backfills from `createdAt`.
         */
        lastSeen: integer("lastSeen", { mode: "timestamp_ms" })
            .notNull()
            .default(sql`0`),
        public: integer("public", { mode: "boolean" }).notNull().default(true),
    },
    (table) => [
        primaryKey({
            name: "BHPlayerAlias_pkey",
            columns: [table.playerId, table.alias],
        }),
        /** Serves `aliasLower LIKE` and `ORDER BY aliasLower` (not partial on `public`). */
        index("BHPlayerAlias_aliasLower_idx").on(table.aliasLower),
        index("BHPlayerAlias_createdAt_idx").on(table.createdAt),
        index("BHPlayerAlias_lastSeen_idx").on(table.lastSeen),
    ],
)

export const bhClan = sqliteTable(
    "BHClan",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        /** Lowercased in JS. See `bhPlayerAlias.aliasLower`. */
        nameLower: text("nameLower").notNull().default(""),
        created: integer("created").default(-1),
        xp: integer("xp").notNull(),
    },
    (table) => [
        index("BHClan_xp_idx").on(table.xp),
        /** Prefix filter + sort order; xp re-rank is a bounded window after. */
        index("BHClan_nameLower_idx").on(table.nameLower),
    ],
)

export const crawlProgress = sqliteTable("CrawlProgress", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    lastUpdated: integer("lastUpdated", { mode: "timestamp_ms" }).notNull(),
    progress: integer("progress").notNull(),
})

export type UserProfile = typeof userProfile.$inferSelect
export type UserSession = typeof userSession.$inferSelect
export type UserFavorite = typeof userFavorite.$inferSelect
export type UserConnection = typeof userConnection.$inferSelect
export type BHPlayerData = typeof bhPlayerData.$inferSelect
export type BHPlayerLegend = typeof bhPlayerLegend.$inferSelect
export type BHPlayerWeapon = typeof bhPlayerWeapon.$inferSelect
export type BHPlayerAlias = typeof bhPlayerAlias.$inferSelect
export type BHRankedQueue = typeof bhRankedQueue.$inferSelect
export type BHClan = typeof bhClan.$inferSelect
export type CrawlProgress = typeof crawlProgress.$inferSelect

export type NewUserProfile = typeof userProfile.$inferInsert
export type NewUserSession = typeof userSession.$inferInsert
export type NewUserFavorite = typeof userFavorite.$inferInsert
export type NewUserConnection = typeof userConnection.$inferInsert
export type NewBHPlayerData = typeof bhPlayerData.$inferInsert
export type NewBHPlayerLegend = typeof bhPlayerLegend.$inferInsert
export type NewBHPlayerWeapon = typeof bhPlayerWeapon.$inferInsert
export type NewBHPlayerAlias = typeof bhPlayerAlias.$inferInsert
export type NewBHRankedQueue = typeof bhRankedQueue.$inferInsert
export type NewBHClan = typeof bhClan.$inferInsert
export type NewCrawlProgress = typeof crawlProgress.$inferInsert
