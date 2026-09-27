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
 * dynamic) and prefix search on clan names and player aliases.
 *
 * Prefix search reads a dedicated lowercase column (`aliasLower`/`nameLower`)
 * rather than a `COLLATE NOCASE` expression index. SQLite's LIKE optimization
 * does accept a `COLLATE NOCASE` index, but it only folds ASCII, and the two
 * search columns are compared with `LIKE` *and* ordered, so the index has to
 * serve both. A plain indexed column does that unambiguously.
 *
 * The ordering matters as much as the index. A prefix `WHERE` is a *range*, so
 * no B-tree can also satisfy an `ORDER BY` on a different column: SQLite falls
 * back to reading every matching row into a temp B-tree and sorting it before
 * the `LIMIT`. On a short prefix that is the whole table, so the search queries
 * order by the searched column itself (which the index already provides) and
 * never sort on a second column. See `web/src/effect/Database.ts`.
 *
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

/**
 * The top of every ladder, sampled often, so a player who just queued is
 * visible within minutes rather than within a crawl cycle.
 *
 * One row per (player, bracket), holding the *last observed* ladder figures.
 * Activity is a delta rather than an absolute: a player has queued when the
 * `games` we now see is higher than the `games` we stored, which is why the
 * table has to exist at all — the signal is a comparison against the previous
 * pass, not anything a single payload can say on its own.
 *
 * `queuedAt` is therefore nullable, and null means "we have seen this player on
 * a ladder but have not yet seen them play". A first observation is not
 * activity: inserting a row for a player we simply had not sampled before would
 * otherwise announce them as having just queued.
 */
export const bhRankedQueue = sqliteTable(
    "BHRankedQueue",
    {
        player_id: text("player_id").notNull(),
        /** `1v1` | `2v2` | `3v3`. Part of the key: one player, three ladders. */
        bracket: text("bracket").notNull(),
        region: text("region").notNull(),
        /** As the ladder spelled it, so the queue needs no join to render. */
        name: text("name").notNull(),
        lastUpdated: integer("lastUpdated", {
            mode: "timestamp_ms",
        }).notNull(),
        rating: integer("rating").notNull(),
        peakRating: integer("peakRating").notNull(),
        tier: text("tier").notNull(),
        games: integer("games").notNull(),
        wins: integer("wins").notNull(),
        /** When a `games` increase was last observed. Null until one is. */
        queuedAt: integer("queuedAt", { mode: "timestamp_ms" }),
    },
    (table) => [
        primaryKey({
            name: "BHRankedQueue_pkey",
            columns: [table.player_id, table.bracket],
        }),
        /** The read is "this ladder, recently queued", so both are in the key. */
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
        /**
         * `alias`, lowercased in JavaScript by the writer.
         *
         * Never written by SQL `lower()`, which does not fold non-ASCII, and
         * never re-derived on read: the search needle is lowercased the same
         * way, so the two always agree.
         */
        aliasLower: text("aliasLower").notNull().default(""),
        /**
         * When this alias was first seen. Written once on insert and
         * deliberately never updated, so it stays a real "created" timestamp.
         */
        createdAt: integer("createdAt", { mode: "timestamp_ms" })
            .notNull()
            .default(now),
        /**
         * When the crawler last saw this alias. Refreshed on every crawler hit.
         *
         * The default is the constant `0`, not `now`: SQLite forbids a
         * parenthesized expression as the default of an
         * `ALTER TABLE ... ADD COLUMN`, which is how this column reaches an
         * already-migrated database ("Cannot add a column with non-constant
         * default"). Note the local `node:sqlite` build accepts it anyway, so
         * `db:seed:verify` cannot catch a regression here — D1 is stricter than
         * the SQLite this repo tests against.
         *
         * Every writer sets `lastSeen` explicitly (see `alias()` in
         * `web/src/effect/Handlers.ts`), so the default only applies to rows
         * inserted around the migration itself, and `0` reads honestly as
         * "never seen" instead of claiming "now". The migration backfills
         * existing rows from `createdAt`.
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
        /**
         * Serves the prefix search end to end: `aliasLower LIKE 'x%'` narrows
         * the range and the same index provides the `ORDER BY aliasLower`.
         *
         * Not partial on `public`: a partial index would drop the non-public
         * rows, but SQLite still has to read them from the table for the
         * `public = 1` check, and this table is almost entirely public anyway.
         */
        index("BHPlayerAlias_aliasLower_idx").on(table.aliasLower),
        /** `getPlayerAliases`, ordered by first-seen. */
        index("BHPlayerAlias_createdAt_idx").on(table.createdAt),
        /** Recency reads and crawler bookkeeping. */
        index("BHPlayerAlias_lastSeen_idx").on(table.lastSeen),
    ],
)

export const bhClan = sqliteTable(
    "BHClan",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        /** `name`, lowercased in JavaScript. See `bhPlayerAlias.aliasLower`. */
        nameLower: text("nameLower").notNull().default(""),
        created: integer("created").default(-1),
        xp: integer("xp").notNull(),
    },
    (table) => [
        index("BHClan_xp_idx").on(table.xp),
        /**
         * Prefix search on `nameLower`, which doubles as its sort order: the
         * clan search filters by name and re-ranks a bounded window by `xp`
         * instead of asking SQLite to sort every prefix match.
         */
        index("BHClan_nameLower_idx").on(table.nameLower),
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
export type BHRankedQueue = typeof bhRankedQueue.$inferSelect
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
export type NewBHRankedQueue = typeof bhRankedQueue.$inferInsert
export type NewBHClan = typeof bhClan.$inferInsert
export type NewCrawlProgress = typeof crawlProgress.$inferInsert
