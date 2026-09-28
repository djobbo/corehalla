import {
    and,
    asc,
    desc,
    eq,
    getTableColumns,
    gte,
    inArray,
    lt,
    sql,
} from "@crh/db/query"
import { Database as SqlDatabase, layer as sqlLayer } from "@crh/db/client"
import { Context, Effect, Layer } from "effect"
import {
    CLANS_RANKINGS_PER_PAGE,
    CLANS_SEARCH_MAX_CANDIDATES,
    GLOBAL_PLAYER_RANKINGS_PER_PAGE,
    SEARCH_MAX_PAGES,
    SEARCH_PLAYERS_ALIASES_PER_PAGE,
} from "../constants"
import {
    bhClan,
    bhPlayerAlias,
    bhPlayerData,
    bhPlayerLegend,
    bhPlayerWeapon,
    bhRankedQueue,
    crawlProgress,
} from "@crh/db/schema"
import { DatabaseError } from "../errors"
import {
    excludedSet,
    hasStorableName,
    playerDataOmitColumns,
    toLegendRows,
    toPlayerDataRow,
    toPlayerRankedRow,
    toWeaponRows,
} from "./player-writes"
import type { D1Database } from "@crh/db/client"
import type { SQLWrapper } from "@crh/db/query"
import type {
    BHClan,
    BHRankedQueue,
    NewBHRankedQueue,
    BHPlayerAlias,
    NewBHClan,
    NewBHPlayerLegend,
    NewBHPlayerWeapon,
} from "@crh/db/schema"
import type { PlayerStats } from "@crh/bhapi/types"
import type { RankedSnapshot } from "./player-writes"
import type {
    AliasSearchResult,
    CareerRanking,
} from "@crh/api-contract/schemas"

/**
 * Server-side database access.
 *
 * Queries go straight to Cloudflare D1 through Drizzle's Effect integration
 * (`drizzle-orm/effect-d1`) on Effect's own D1 client, so there is no HTTP
 * layer between the server and the database. The client itself is built by
 * `db/client`, which is the single place that knows about the `DB` binding.
 *
 * ## Why these queries look the way they do
 *
 * Prefix search on a short needle (`"pl"`) matches a huge share of the table.
 * The trap is pairing that range with an `ORDER BY` on a *different* column
 * (`createdAt`, `xp`): a B-tree can serve a range or an order, not both, so
 * SQLite reads every matching row, sorts it through a temp B-tree, and only
 * then applies the `LIMIT`. Verified on 1M rows, `LIKE 'pl%'` with
 * `ORDER BY createdAt DESC` was ~50x slower than the same scan with no sort.
 * Since D1 bills and limits on rows *read*, that is also a cost bug.
 *
 * So every search here orders by the column it filters on, which the index
 * already provides, and the page depth is capped (`SEARCH_MAX_PAGES`) because
 * `OFFSET` still walks the skipped index entries.
 *
 * Text matching goes through `aliasLower`/`nameLower`, lowercased in
 * JavaScript by the writer. `LIKE` is case-insensitive for ASCII only, so
 * relying on its default collation would silently miss non-ASCII names; the
 * needles below are folded with the same `searchKey` helper the writers use.
 *
 * Operations fail with a typed `DatabaseError`; handlers decide whether that
 * becomes a defect (HTTP 500) or an empty result (e.g. optional player
 * aliases).
 */
/**
 * D1's bound-parameter ceiling, per statement.
 *
 * Documented rather than measured, and enforced by the local simulator as well
 * as by the deployed database — which is the only reason the two agree.
 */
const D1_MAX_BOUND_PARAMS = 100

export class Database extends Context.Service<
    Database,
    {
        readonly getPlayerAliases: (
            playerId: string,
        ) => Effect.Effect<readonly string[], DatabaseError>
        readonly upsertPlayerAliases: (
            aliases: readonly BHPlayerAlias[],
        ) => Effect.Effect<void, DatabaseError>
        readonly upsertClan: (
            clan: NewBHClan,
        ) => Effect.Effect<void, DatabaseError>
        readonly getClansRankings: (
            name: string,
            page: number,
        ) => Effect.Effect<readonly BHClan[], DatabaseError>
        /**
         * The stored XP for a clan, or `null` when we have never seen it.
         *
         * `/v1/player/guild` carries a membership but not the clan's own XP, and
         * the profile both renders that number and divides by it. Reading our
         * own row keeps a v1-served profile from costing a third upstream
         * request; `null` lets the caller omit the clan card instead of showing
         * a fabricated total.
         */
        readonly getClanXp: (
            clanId: string,
        ) => Effect.Effect<string | null, DatabaseError>
        /**
         * Exact-alias lookup used by the public `/api/rankings/search/player`
         * route (the grouped prefix search is `searchAliases`).
         */
        readonly searchExactAliases: (
            alias: string,
            page: number,
        ) => Effect.Effect<readonly BHPlayerAlias[], DatabaseError>
        readonly getGlobalPlayerRankings: (
            sortBy: string,
            page: number,
        ) => Effect.Effect<readonly CareerRanking[], DatabaseError>
        /**
         * The same board, restricted to players who have played one legend.
         *
         * `sortBy` is a column of `BHPlayerLegend`, so the numbers are that
         * legend's own — "most games with Bodvar", not "most games, among
         * players who have played Bodvar".
         */
        readonly getGlobalLegendRankings: (
            legendId: number,
            sortBy: string,
            page: number,
        ) => Effect.Effect<readonly CareerRanking[], DatabaseError>
        /**
         * The same board again, restricted to one weapon.
         *
         * Reads `BHPlayerWeapon`, which the ingest materialises from the
         * legend rows, so the sum is done once when a player is written rather
         * than on every request.
         */
        readonly getGlobalWeaponRankings: (
            weapon: string,
            sortBy: string,
            page: number,
        ) => Effect.Effect<readonly CareerRanking[], DatabaseError>
        readonly searchAliases: (
            alias: string,
            page: number,
        ) => Effect.Effect<readonly AliasSearchResult[], DatabaseError>
        /**
         * Writes a player's stats, top legends and top weapons in one call.
         *
         * The three tables are one logical fact — a player's current standing —
         * so they are written together rather than exposing three methods the
         * caller has to remember to sequence.
         */
        readonly upsertPlayerStats: (
            playerStats: PlayerStats,
            /**
             * The player's 1v1 standing, or `null` when the caller has none.
             *
             * Nullable rather than optional so every caller has to say which it
             * is: `null` means "I looked and there is nothing" or "this request
             * never had it", and either way the ranked columns are left alone
             * on an existing row rather than overwritten with zeros.
             */
            ranked: RankedSnapshot | null,
        ) => Effect.Effect<void, DatabaseError>
        /**
         * The ranked half of a `BHPlayerData` row, on its own.
         *
         * The counterpart to `upsertPlayerStats`: a profile's ranked endpoint
         * holds the standing but none of the career stats, and this is how it
         * contributes what it has without waiting for the crawler. Neither
         * caller overwrites the other's columns — see `playerDataOmitColumns`.
         */
        readonly upsertPlayerRanked: (
            player: { readonly id: string; readonly name: string },
            ranked: RankedSnapshot,
        ) => Effect.Effect<void, DatabaseError>
        /**
         * Records one ladder page into the ranked queue.
         *
         * Whether a player *queued* is decided here rather than by the caller:
         * the row is only written when its `games` is higher than the stored
         * one, and only then is `queuedAt` stamped. A page whose figures are
         * unchanged costs a statement and writes nothing, which is what keeps a
         * pass every ten minutes from being 6,750 writes.
         */
        readonly upsertRankedQueue: (
            rows: readonly NewBHRankedQueue[],
        ) => Effect.Effect<void, DatabaseError>
        /**
         * Drops one ladder's entries the sampler has not seen change since
         * `before` — see `RANKED_QUEUE_RETENTION_MS` for why that is safe.
         */
        readonly pruneRankedQueue: (
            bracket: string,
            region: string,
            before: Date,
        ) => Effect.Effect<void, DatabaseError>
        /** Everyone on one ladder whose game count rose since `queuedSince`. */
        readonly getRankedQueue: (
            bracket: string,
            region: string,
            queuedSince: Date,
        ) => Effect.Effect<readonly BHRankedQueue[], DatabaseError>
        /**
         * The page a crawl target resumes from, or `null` when it has never
         * been crawled.
         *
         * Keyed by target, so each ladder keeps its own cursor. The previous
         * single `"Crawler"` row could only describe one ladder's position,
         * which is part of why only one ladder was ever walked.
         */
        readonly getCrawlProgress: (
            targetId: string,
        ) => Effect.Effect<number | null, DatabaseError>
        readonly setCrawlProgress: (
            targetId: string,
            label: string,
            page: number,
        ) => Effect.Effect<void, DatabaseError>
    }
>()("app/Database") {}

/**
 * Folds a user-typed string into the form stored in `aliasLower`/`nameLower`.
 *
 * The writers use this too, so a search key and a stored key can never
 * disagree. `toLowerCase()` (not SQL `lower()`) is what makes non-ASCII names
 * match.
 */
export const searchKey = (value: string): string => value.trim().toLowerCase()

/**
 * The half-open range `[prefix, upper)` covering every string starting with
 * `prefix`, or `undefined` for the degenerate case where `prefix` is already
 * the maximum code point.
 *
 * A range is used instead of `LIKE 'x%'` on purpose. SQLite's LIKE
 * optimization only rewrites `LIKE` into a range when the comparison is
 * case-*sensitive*, which by default it is not (`case_sensitive_like` is off),
 * so `LIKE` against a plain BINARY index degrades to `SCAN ... USING INDEX` —
 * every entry walked, which is the cost this whole file exists to avoid. The
 * old schema dodged that by indexing an explicit `COLLATE NOCASE` expression.
 * Now that both sides are already lowercased in JavaScript, the range states
 * the same intent directly and needs no pragma.
 *
 * It also removes `LIKE`'s wildcard escaping: `%` and `_` in user input are
 * matched literally by a range comparison, so there is nothing to escape.
 */
const prefixRange = (
    prefix: string,
): { readonly from: string; readonly to: string } | undefined => {
    if (prefix.length === 0) return undefined

    const lastCodePoint = prefix.codePointAt(prefix.length - 1)

    // `\uFFFF` has no higher code unit to stop at; the caller falls back to the
    // lower bound only.
    if (lastCodePoint === undefined || lastCodePoint >= 0xffff) return undefined

    return {
        from: prefix,
        to: prefix.slice(0, -1) + String.fromCodePoint(lastCodePoint + 1),
    }
}

/**
 * A page beyond the cap is refused rather than served with a growing `OFFSET`.
 *
 * `page` arrives from the URL and is only validated as a finite number, so
 * this is also what keeps a hand-written `?page=100000` from turning into a
 * full table walk.
 */
const assertPageWithinCap = (
    page: number,
    maxPages: number,
    what: string,
): DatabaseError | undefined =>
    page > maxPages
        ? new DatabaseError({
              cause: `Search page ${page} is past the ${maxPages}-page search limit (${what})`,
          })
        : undefined

/**
 * Re-orders one page of name-ordered clan candidates by `xp`.
 *
 * The candidate window is capped, so the top clans for a prefix are the
 * highest-`xp` clans *within the first `CLANS_SEARCH_MAX_CANDIDATES` names*.
 * Ranking the whole match set would mean sorting every prefix hit, which is
 * exactly the cost this avoids.
 */
const byXpDesc = (a: BHClan, b: BHClan): number => b.xp - a.xp

/**
 * The `WHERE` fragment matching a lowercased prefix on a lowercased column.
 *
 * Callers pass the column explicitly so this stays usable for both
 * `aliasLower` and `nameLower` without a table-specific union.
 */
const isPrefixOf = (column: SQLWrapper, prefix: string) => {
    const range = prefixRange(prefix)

    // A prefix already at the maximum code point has no upper bound to stop
    // at, so only the lower bound applies and the walk runs to the end.
    return range === undefined
        ? sql`${column} >= ${prefix}`
        : sql`${column} >= ${range.from} AND ${column} < ${range.to}`
}

/** Turns any driver/query failure into the domain's `DatabaseError`. */
const run = <A, E, R>(
    effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, DatabaseError, R> =>
    effect.pipe(Effect.mapError((cause) => new DatabaseError({ cause })))

/**
 * The domain service, built on whatever `SqlDatabase` client is in context.
 *
 * Splitting the client out lets `Server.ts` build one and share it between the
 * stats services and `Auth`; `makeLayer` is the convenience wrapper for one-off
 * server routes.
 */
export const layer = Layer.effect(
    Database,
    Effect.gen(function* () {
        const db = yield* SqlDatabase

        /**
         * The sortable column is dynamic. The HTTP layer validates `sortBy`
         * against the `SortablePlayerProp` literals; this lookup keeps the
         * query typed without interpolating an identifier.
         */
        const playerColumns = getTableColumns(bhPlayerData)

        /** The sortable columns of the two per-legend / per-weapon boards. */
        const legendColumns = getTableColumns(bhPlayerLegend)
        const weaponColumns = getTableColumns(bhPlayerWeapon)

        return Database.of({
            getPlayerAliases: (playerId) =>
                run(
                    db
                        .select({ alias: bhPlayerAlias.alias })
                        .from(bhPlayerAlias)
                        .where(
                            and(
                                eq(bhPlayerAlias.playerId, playerId),
                                eq(bhPlayerAlias.public, true),
                            ),
                        )
                        .orderBy(desc(bhPlayerAlias.createdAt)),
                ).pipe(Effect.map((rows) => rows.map((row) => row.alias))),

            getClanXp: (clanId) =>
                run(
                    db
                        .select({ xp: bhClan.xp })
                        .from(bhClan)
                        .where(eq(bhClan.id, clanId))
                        .limit(1),
                ).pipe(
                    Effect.map((rows) => (rows[0] ? String(rows[0].xp) : null)),
                ),

            upsertPlayerStats: (playerStats, ranked) =>
                run(
                    Effect.gen(function* () {
                        const playerId = playerStats.brawlhalla_id.toString()
                        const playerData = toPlayerDataRow(playerStats, ranked)

                        yield* db
                            .insert(bhPlayerData)
                            .values(playerData)
                            .onConflictDoUpdate({
                                target: bhPlayerData.id,
                                /*
                                 * A caller with no ranked record leaves those
                                 * columns out of `SET`. Without that, a profile
                                 * view — which has the career stats but not the
                                 * ranked snapshot — would reset a crawled
                                 * player's tier, rating and region to zero on
                                 * every visit.
                                 */
                                set: excludedSet(
                                    playerData,
                                    // This writer owns the stats; it may only
                                    // set the ranked columns when it was handed
                                    // a snapshot to set them from — and it may
                                    // only set the name when the payload it was
                                    // handed actually carried one.
                                    playerDataOmitColumns({
                                        stats: true,
                                        ranked: ranked !== null,
                                        name: hasStorableName(playerData.name),
                                    }),
                                ),
                            })

                        const legendRows = toLegendRows(playerId, playerStats)

                        if (legendRows.length > 0) {
                            yield* db
                                .insert(bhPlayerLegend)
                                .values(legendRows)
                                .onConflictDoUpdate({
                                    target: [
                                        bhPlayerLegend.player_id,
                                        bhPlayerLegend.legend_id,
                                    ],
                                    // `excluded`, not a literal off the first
                                    // row: one `SET` covers the whole batch, so
                                    // literals would give every legend the first
                                    // legend's statistics.
                                    set: excludedSet(
                                        legendRows[0] as unknown as Record<
                                            string,
                                            unknown
                                        >,
                                        ["player_id", "legend_id"],
                                    ) as Partial<NewBHPlayerLegend>,
                                })
                        }

                        const weaponRows = toWeaponRows(playerId, playerStats)

                        if (weaponRows.length > 0) {
                            yield* db
                                .insert(bhPlayerWeapon)
                                .values(weaponRows)
                                .onConflictDoUpdate({
                                    target: [
                                        bhPlayerWeapon.player_id,
                                        bhPlayerWeapon.weapon_name,
                                    ],
                                    set: excludedSet(
                                        weaponRows[0] as unknown as Record<
                                            string,
                                            unknown
                                        >,
                                        ["player_id", "weapon_name"],
                                    ) as Partial<NewBHPlayerWeapon>,
                                })
                        }
                    }),
                ),

            upsertPlayerRanked: (player, ranked) =>
                run(
                    Effect.gen(function* () {
                        /*
                         * Built once: `toPlayerRankedRow` stamps
                         * `lastUpdated`, so calling it twice would write one
                         * timestamp and set another.
                         */
                        const row = toPlayerRankedRow(player, ranked)

                        yield* db
                            .insert(bhPlayerData)
                            .values(row)
                            .onConflictDoUpdate({
                                target: bhPlayerData.id,
                                /*
                                 * The stats columns are the ones left out here.
                                 * A profile's ranked endpoint has the standing
                                 * and none of the career totals, so letting it
                                 * write them would zero every stat the moment
                                 * somebody viewed a player whose stats request
                                 * had not landed yet.
                                 */
                                set: excludedSet(
                                    row,
                                    playerDataOmitColumns({
                                        stats: false,
                                        ranked: true,
                                        name: hasStorableName(row.name),
                                    }),
                                ),
                            })
                    }),
                ),

            upsertRankedQueue: (rows) =>
                run(
                    Effect.gen(function* () {
                        if (rows.length === 0) return

                        /*
                         * D1 caps a statement at 100 bound parameters, and a
                         * ladder page is ~50 rows of 11 columns — 550 of them.
                         * Sending the page in one statement fails outright with
                         * nothing in the response to say why, which is how this
                         * shipped broken: the local simulator enforces the same
                         * cap the deployed database does, and the error surfaced
                         * only as a Caught warning in the crawler's log.
                         *
                         * Nine rows fit in the budget with one to spare. The
                         * alternative — reading the ladder first and writing only
                         * what changed — would be fewer statements, but this is
                         * the one that is correct for the first pass too, when
                         * every row is new.
                         */
                        const columns = Object.keys(rows[0] ?? {}).length
                        const perStatement = Math.max(
                            1,
                            Math.floor(
                                D1_MAX_BOUND_PARAMS / Math.max(1, columns),
                            ),
                        )

                        for (
                            let index = 0;
                            index < rows.length;
                            index += perStatement
                        ) {
                            const batch = rows.slice(
                                index,
                                index + perStatement,
                            )

                            yield* db
                                .insert(bhRankedQueue)
                                .values([...batch])
                                .onConflictDoUpdate({
                                    target: [
                                        bhRankedQueue.entry_id,
                                        bhRankedQueue.bracket,
                                    ],
                                    set: {
                                        ...excludedSet(
                                            batch[0] as unknown as Record<
                                                string,
                                                unknown
                                            >,
                                            ["entry_id", "bracket", "queuedAt"],
                                        ),
                                        /*
                                         * The insert's `queuedAt` is null and
                                         * the update's is "now", which is why
                                         * this is not `excluded."queuedAt"`: a
                                         * first observation is not activity.
                                         */
                                        queuedAt: sql`excluded."lastUpdated"`,
                                        /*
                                         * Evaluated against the *original* row,
                                         * so these read as "new minus old".
                                         * SQLite resolves the bare table columns
                                         * in a `DO UPDATE` to the existing
                                         * values regardless of the order these
                                         * appear in, so assigning `rating`
                                         * below does not disturb the
                                         * subtraction above it.
                                         *
                                         * The `= 0` guard is not defensive: 0 is
                                         * what a row carries when we have never
                                         * recorded that figure, which is every
                                         * row that predates this column. Without
                                         * it the first event after the migration
                                         * subtracts zero and reports the player's
                                         * *whole rank* as places gained — a
                                         * number that looks like a real result
                                         * and is not. Zero is never a genuine
                                         * ladder position or rating, so the
                                         * sentinel is unambiguous.
                                         */
                                        ratingDelta: sql`CASE WHEN ${bhRankedQueue.rating} = 0 THEN 0 ELSE excluded."rating" - ${bhRankedQueue.rating} END`,
                                        rankDelta: sql`CASE WHEN ${bhRankedQueue.rank} = 0 THEN 0 ELSE excluded."rank" - ${bhRankedQueue.rank} END`,
                                    },
                                    // The gate: everything above only runs
                                    // when the game count actually rose.
                                    where: sql`excluded."games" > ${bhRankedQueue.games}`,
                                })
                        }
                    }),
                ),

            pruneRankedQueue: (bracket, region, before) =>
                run(
                    db
                        .delete(bhRankedQueue)
                        .where(
                            and(
                                eq(bhRankedQueue.bracket, bracket),
                                eq(bhRankedQueue.region, region),
                                lt(bhRankedQueue.lastUpdated, before),
                            ),
                        ),
                ),

            getRankedQueue: (bracket, region, queuedSince) =>
                run(
                    db
                        .select()
                        .from(bhRankedQueue)
                        .where(
                            and(
                                eq(bhRankedQueue.bracket, bracket),
                                /*
                                 * `all` is the merge of the real regions, and
                                 * the sampler never writes a row for it — that
                                 * would file every entry a second time under a
                                 * region it does not belong to. So the merged
                                 * view is the *absence* of this predicate
                                 * rather than a row that does not exist:
                                 * everyone queued anywhere, under one heading.
                                 *
                                 * An entry belongs to exactly one region, and
                                 * the key is (entry, bracket), so nothing is
                                 * duplicated by dropping the filter.
                                 */
                                region === "all"
                                    ? undefined
                                    : eq(bhRankedQueue.region, region),
                                // Null `queuedAt` — never seen to play — is
                                // excluded by SQL's own null comparison.
                                gte(bhRankedQueue.queuedAt, queuedSince),
                            ),
                        )
                        .orderBy(desc(bhRankedQueue.rating)),
                ),

            getCrawlProgress: (targetId) =>
                run(
                    db
                        .select({ progress: crawlProgress.progress })
                        .from(crawlProgress)
                        .where(eq(crawlProgress.id, targetId))
                        .limit(1),
                ).pipe(Effect.map((rows) => rows[0]?.progress ?? null)),

            setCrawlProgress: (targetId, label, page) =>
                run(
                    db
                        .insert(crawlProgress)
                        .values({
                            id: targetId,
                            name: label,
                            progress: page,
                            lastUpdated: new Date(),
                        })
                        .onConflictDoUpdate({
                            target: crawlProgress.id,
                            set: {
                                progress: page,
                                name: label,
                                lastUpdated: new Date(),
                            },
                        }),
                ).pipe(Effect.asVoid),

            upsertPlayerAliases: (aliases) =>
                run(
                    Effect.gen(function* () {
                        if (aliases.length === 0) return

                        // `BHPlayerAlias` has a composite primary key, so a
                        // repeated pair inside one statement would be
                        // `UNIQUE constraint failed`, not a conflict the
                        // upsert clause can absorb. Dedupe by key first.
                        const deduped = [
                            ...new Map(
                                aliases.map((alias) => [
                                    `${alias.playerId}\u0000${alias.alias}`,
                                    alias,
                                ]),
                            ).values(),
                        ]

                        // D1 allows 100 bound parameters per statement. Chunk
                        // so a clan roster of any size still upserts, and so
                        // the row count stays a function of the batch, not of
                        // how many members the clan happens to have.
                        const columnsPerRow = 6
                        const rowsPerStatement = Math.max(
                            1,
                            Math.floor(100 / columnsPerRow) - 1,
                        )

                        for (
                            let index = 0;
                            index < deduped.length;
                            index += rowsPerStatement
                        ) {
                            const batch = deduped.slice(
                                index,
                                index + rowsPerStatement,
                            )

                            yield* db
                                .insert(bhPlayerAlias)
                                .values([...batch])
                                .onConflictDoUpdate({
                                    target: [
                                        bhPlayerAlias.playerId,
                                        bhPlayerAlias.alias,
                                    ],
                                    // `createdAt` is intentionally absent: it
                                    // records first sight and must not move on
                                    // re-crawl. Only the "seen again" bookkeeping
                                    // and the current display name are refreshed.
                                    set: {
                                        lastSeen: sql`excluded."lastSeen"`,
                                        aliasLower: sql`excluded."aliasLower"`,
                                        public: sql`excluded."public"`,
                                    },
                                })
                        }
                    }),
                ),

            upsertClan: (clan) =>
                run(
                    db
                        .insert(bhClan)
                        .values(clan)
                        .onConflictDoUpdate({
                            target: bhClan.id,
                            set: {
                                name: clan.name,
                                nameLower: clan.nameLower,
                                xp: clan.xp,
                                ...(clan.created === undefined
                                    ? {}
                                    : { created: clan.created }),
                            },
                        }),
                ),

            getClansRankings: (name, page) =>
                run(
                    Effect.gen(function* () {
                        const invalid = assertPageWithinCap(
                            page,
                            Math.ceil(
                                CLANS_SEARCH_MAX_CANDIDATES /
                                    CLANS_RANKINGS_PER_PAGE,
                            ),
                            "clans",
                        )
                        if (invalid) return yield* invalid

                        const needle = searchKey(name)
                        const offset = (page - 1) * CLANS_RANKINGS_PER_PAGE

                        // With no needle this is the plain "top clans by xp"
                        // ranking, which `BHClan_xp_idx` serves directly.
                        if (needle.length === 0) {
                            return yield* db
                                .select()
                                .from(bhClan)
                                .orderBy(desc(bhClan.xp))
                                .limit(CLANS_RANKINGS_PER_PAGE)
                                .offset(offset)
                        }

                        // Prefix filter and sort agree on `nameLower`, so this
                        // is one index range walk with no temp B-tree. The
                        // window is capped at the candidates worth ranking;
                        // deeper pages are refused above.
                        const windowSize = Math.min(
                            CLANS_SEARCH_MAX_CANDIDATES,
                            offset + CLANS_RANKINGS_PER_PAGE,
                        )

                        const candidates = yield* db
                            .select()
                            .from(bhClan)
                            .where(isPrefixOf(bhClan.nameLower, needle))
                            .orderBy(asc(bhClan.nameLower))
                            .limit(windowSize)

                        return candidates
                            .sort(byXpDesc)
                            .slice(offset, offset + CLANS_RANKINGS_PER_PAGE)
                    }),
                ),

            searchExactAliases: (alias, page) =>
                run(
                    Effect.gen(function* () {
                        const invalid = assertPageWithinCap(
                            page,
                            SEARCH_MAX_PAGES,
                            "exact aliases",
                        )
                        if (invalid) return yield* invalid

                        // The old shape was `LIKE alias` with no wildcard,
                        // which is an exact match only by accident. On the
                        // normalized column this is a real equality, so the
                        // unique index on (playerId, alias) is bypassed for
                        // the `aliasLower` index instead of a LIKE scan.
                        return yield* db
                            .select()
                            .from(bhPlayerAlias)
                            .where(
                                eq(bhPlayerAlias.aliasLower, searchKey(alias)),
                            )
                            .orderBy(
                                asc(bhPlayerAlias.alias),
                                asc(bhPlayerAlias.playerId),
                            )
                            .limit(SEARCH_PLAYERS_ALIASES_PER_PAGE)
                            .offset(
                                (page - 1) * SEARCH_PLAYERS_ALIASES_PER_PAGE,
                            )
                    }),
                ),

            getGlobalPlayerRankings: (sortBy, page) =>
                run(
                    Effect.gen(function* () {
                        const column =
                            playerColumns[sortBy as keyof typeof playerColumns]

                        if (!column) {
                            return yield* new DatabaseError({
                                cause: `Unknown sort column: ${sortBy}`,
                            })
                        }

                        const rows = yield* db
                            .select({
                                id: bhPlayerData.id,
                                name: bhPlayerData.name,
                                tier: bhPlayerData.tier,
                                rating: bhPlayerData.rating,
                                region: bhPlayerData.region,
                                peakRating: bhPlayerData.peakRating,
                                prop: column,
                            })
                            .from(bhPlayerData)
                            .orderBy(desc(column))
                            .limit(GLOBAL_PLAYER_RANKINGS_PER_PAGE)
                            .offset(
                                (page - 1) * GLOBAL_PLAYER_RANKINGS_PER_PAGE,
                            )

                        // Every sortable property is an integer column, so
                        // the union of column value types narrows to
                        // `number`.
                        return rows.map((row) => ({
                            ...row,
                            prop: row.prop as number,
                        }))
                    }),
                ),

            getGlobalLegendRankings: (legendId, sortBy, page) =>
                run(
                    Effect.gen(function* () {
                        const column =
                            legendColumns[sortBy as keyof typeof legendColumns]

                        if (!column) {
                            return yield* new DatabaseError({
                                cause: `Unknown sort column: ${sortBy}`,
                            })
                        }

                        const rows = yield* db
                            .select({
                                id: bhPlayerData.id,
                                name: bhPlayerData.name,
                                tier: bhPlayerData.tier,
                                rating: bhPlayerData.rating,
                                region: bhPlayerData.region,
                                peakRating: bhPlayerData.peakRating,
                                prop: column,
                            })
                            .from(bhPlayerLegend)
                            .innerJoin(
                                bhPlayerData,
                                eq(bhPlayerLegend.player_id, bhPlayerData.id),
                            )
                            .where(eq(bhPlayerLegend.legend_id, legendId))
                            /*
                             * `id` breaks ties, and it is not cosmetic: the
                             * leaderboard is paged by offset, so two players
                             * level on the sorted column could otherwise swap
                             * places between requests — showing one of them
                             * twice across a page boundary and never showing
                             * the other.
                             */
                            .orderBy(desc(column), asc(bhPlayerData.id))
                            .limit(GLOBAL_PLAYER_RANKINGS_PER_PAGE)
                            .offset(
                                (page - 1) * GLOBAL_PLAYER_RANKINGS_PER_PAGE,
                            )

                        return rows.map((row) => ({
                            ...row,
                            prop: row.prop as number,
                        }))
                    }),
                ),

            getGlobalWeaponRankings: (weapon, sortBy, page) =>
                run(
                    Effect.gen(function* () {
                        const column =
                            weaponColumns[sortBy as keyof typeof weaponColumns]

                        if (!column) {
                            return yield* new DatabaseError({
                                cause: `Unknown sort column: ${sortBy}`,
                            })
                        }

                        const rows = yield* db
                            .select({
                                id: bhPlayerData.id,
                                name: bhPlayerData.name,
                                tier: bhPlayerData.tier,
                                rating: bhPlayerData.rating,
                                region: bhPlayerData.region,
                                peakRating: bhPlayerData.peakRating,
                                prop: column,
                            })
                            .from(bhPlayerWeapon)
                            .innerJoin(
                                bhPlayerData,
                                eq(bhPlayerWeapon.player_id, bhPlayerData.id),
                            )
                            .where(eq(bhPlayerWeapon.weapon_name, weapon))
                            .orderBy(desc(column), asc(bhPlayerData.id))
                            .limit(GLOBAL_PLAYER_RANKINGS_PER_PAGE)
                            .offset(
                                (page - 1) * GLOBAL_PLAYER_RANKINGS_PER_PAGE,
                            )

                        return rows.map((row) => ({
                            ...row,
                            prop: row.prop as number,
                        }))
                    }),
                ),

            searchAliases: (alias, page) =>
                run(
                    Effect.gen(function* () {
                        const needle = searchKey(alias)

                        if (needle.length < 2) return []

                        const invalid = assertPageWithinCap(
                            page,
                            SEARCH_MAX_PAGES,
                            "aliases",
                        )
                        if (invalid) return yield* invalid

                        // Replaces the old `search_aliases` plpgsql function:
                        // one page of players whose alias starts with the
                        // needle, then every public alias of those players.
                        //
                        // Ordered by `aliasLower` alone: `createdAt` is
                        // refreshed on every crawl, so "most recently seen
                        // first" was close to random for a prefix search, and
                        // sorting on it forced a temp B-tree over the whole
                        // match set. The index's own order is deterministic,
                        // stable across pages, and free.
                        const matches = yield* db
                            .select({
                                playerId: bhPlayerAlias.playerId,
                                alias: bhPlayerAlias.alias,
                            })
                            .from(bhPlayerAlias)
                            .where(
                                and(
                                    isPrefixOf(
                                        bhPlayerAlias.aliasLower,
                                        needle,
                                    ),
                                    eq(bhPlayerAlias.public, true),
                                ),
                            )
                            .orderBy(asc(bhPlayerAlias.aliasLower))
                            .limit(SEARCH_PLAYERS_ALIASES_PER_PAGE)
                            .offset(
                                (page - 1) * SEARCH_PLAYERS_ALIASES_PER_PAGE,
                            )

                        if (matches.length === 0) return []

                        const playerIds = [
                            ...new Set(matches.map((row) => row.playerId)),
                        ]

                        const rows = yield* db
                            .select()
                            .from(bhPlayerAlias)
                            .where(inArray(bhPlayerAlias.playerId, playerIds))
                            .orderBy(
                                asc(bhPlayerAlias.playerId),
                                asc(bhPlayerAlias.alias),
                            )

                        // `mainAlias` is the alias the user's needle actually
                        // matched, so the row is labelled with the name they
                        // were typing toward; the player's other names follow,
                        // and `public` is filtered here rather than in SQL so
                        // a match can never be dropped by its own visibility.
                        const details = new Map<string, string[]>()

                        for (const row of rows) {
                            if (!row.public) continue

                            const aliases = details.get(row.playerId)

                            if (aliases) {
                                aliases.push(row.alias)
                            } else {
                                details.set(row.playerId, [row.alias])
                            }
                        }

                        /**
                         * Rebuilt in the order the index walk returned, not
                         * re-sorted here.
                         *
                         * The `matches` scan is what defines the page boundary,
                         * so its order has to be the order the client sees:
                         * sorting again with `localeCompare` would order
                         * non-ASCII names differently from SQLite's BINARY
                         * collation and could repeat or skip a player between
                         * pages. Walking `matches` also dedupes the players
                         * whose every alias matched the same needle.
                         */
                        const results: AliasSearchResult[] = []
                        const seen = new Set<string>()

                        for (const match of matches) {
                            if (seen.has(match.playerId)) continue

                            seen.add(match.playerId)

                            const aliases = details.get(match.playerId)

                            if (!aliases) continue

                            results.push({
                                playerId: match.playerId,
                                mainAlias: match.alias,
                                otherAliases: aliases.filter(
                                    (alias) => alias !== match.alias,
                                ),
                            })
                        }

                        return results
                    }),
                ),
        })
    }),
)

/** Builds the domain service on its own D1 client. */
export const makeLayer = (db: D1Database) =>
    layer.pipe(Layer.provide(sqlLayer(db)))
