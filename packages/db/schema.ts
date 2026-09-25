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
 * Database schema — Cloudflare D1 (SQLite).
 *
 * The database is a single D1 SQLite database. Table and column names are kept
 * identical to the Postgres/Prisma era so the query layer and the seeded data
 * generator stay readable; only the column *types* changed:
 *
 * - `uuid`      -> `text` (SQLite has no uuid type); ids default to
 *                  `crypto.randomUUID()` in the application.
 * - `timestamp` -> `integer` in `timestamp_ms` mode (epoch milliseconds, so
 *                  `Date#getTime()` comparisons keep working).
 * - `jsonb`     -> `text` in `json` mode (JSON string).
 * - `boolean`   -> `integer` in `boolean` mode (0/1).
 *
 * `createdAt`/`lastUpdated`/`lastSeenAt` default to `(unixepoch() * 1000)`, so
 * rows inserted without them (for example by `Auth.upsertDiscordUser`) still
 * get a millisecond timestamp.
 *
 * The crawl tables carry indexes for the two hot read paths: the global player
 * rankings (one index per sortable column, because the `ORDER BY` column is
 * dynamic) and case-insensitive prefix search on clan names and player aliases
 * (`lower(...)` expression indexes, which SQLite can use for `LIKE 'x%'`).
 * Indexes add one written row per indexed column on every write, so keep the
 * crawler's write volume in mind when adding more.
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

const now = sql`(unixepoch() * 1000)`

/** Columns exposed as global-ranking sort options (see `getGlobalPlayerRankings`). */
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
        /**
         * Discord snowflake. Nullable because rows created before the
         * app-owned auth have no local Discord id until they sign in again.
         */
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

/**
 * Discord OAuth sessions.
 *
 * `id` is the SHA-256 hex digest of the opaque token stored in the browser
 * cookie, so a database leak cannot be replayed as a login.
 */
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

export const bhPlayerAlias = sqliteTable(
    "BHPlayerAlias",
    {
        playerId: text("playerId").notNull(),
        alias: text("alias").notNull(),
        createdAt: integer("createdAt", { mode: "timestamp_ms" })
            .notNull()
            .default(now),
        public: integer("public", { mode: "boolean" }).notNull().default(true),
    },
    (table) => [
        primaryKey({
            name: "BHPlayerAlias_pkey",
            columns: [table.playerId, table.alias],
        }),
        // Case-insensitive prefix search (`alias LIKE 'x%'`). The `NOCASE`
        // collation on the *index* is what lets SQLite's LIKE optimization use
        // it; a `lower(alias)` expression index would not be.
        index("BHPlayerAlias_alias_nocase_idx").on(
            sql`${table.alias} COLLATE NOCASE`,
        ),
        index("BHPlayerAlias_createdAt_idx").on(table.createdAt),
    ],
)

export const bhClan = sqliteTable(
    "BHClan",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        created: integer("created").default(-1),
        xp: integer("xp").notNull(),
    },
    (table) => [
        index("BHClan_xp_idx").on(table.xp),
        // Case-insensitive prefix search (`name LIKE 'x%'`).
        index("BHClan_name_nocase_idx").on(sql`${table.name} COLLATE NOCASE`),
    ],
)

export const crawlProgress = sqliteTable("CrawlProgress", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    lastUpdated: integer("lastUpdated", { mode: "timestamp_ms" }).notNull(),
    progress: integer("progress").notNull(),
})

// --- row types --------------------------------------------------------------

export type UserProfile = typeof userProfile.$inferSelect
export type UserSession = typeof userSession.$inferSelect
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
export type NewUserSession = typeof userSession.$inferInsert
export type NewUserFavorite = typeof userFavorite.$inferInsert
export type NewUserConnection = typeof userConnection.$inferInsert
export type NewBHPlayerData = typeof bhPlayerData.$inferInsert
export type NewBHPlayerLegend = typeof bhPlayerLegend.$inferInsert
export type NewBHPlayerWeapon = typeof bhPlayerWeapon.$inferInsert
export type NewBHPlayerAlias = typeof bhPlayerAlias.$inferInsert
export type NewBHClan = typeof bhClan.$inferInsert
export type NewCrawlProgress = typeof crawlProgress.$inferInsert
