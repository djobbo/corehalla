import { and, asc, desc, eq, getTableColumns, inArray, sql } from "@crh/db/query"
import { Database as SqlDatabase, layer as sqlLayer } from "@crh/db/client"
import { Context, Effect, Layer } from "effect"
import {
    CLANS_RANKINGS_PER_PAGE,
    CLANS_SEARCH_MAX_CANDIDATES,
    GLOBAL_PLAYER_RANKINGS_PER_PAGE,
    SEARCH_MAX_PAGES,
    SEARCH_PLAYERS_ALIASES_PER_PAGE,
} from "@util/constants"
import { bhClan, bhPlayerAlias, bhPlayerData } from "@crh/db/schema"
import { DatabaseError } from "./errors"
import type { D1Database } from "@crh/db/client"
import type { SQLWrapper } from "@crh/db/query"
import type { BHClan, BHPlayerAlias, NewBHClan } from "@crh/db/schema"
import type { AliasSearchResult, GlobalPlayerRanking } from "./schemas"

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
        ) => Effect.Effect<readonly GlobalPlayerRanking[], DatabaseError>
        readonly searchAliases: (
            alias: string,
            page: number,
        ) => Effect.Effect<readonly AliasSearchResult[], DatabaseError>
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
