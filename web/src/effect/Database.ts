import {
    and,
    asc,
    desc,
    eq,
    getTableColumns,
    inArray,
    like,
    sql,
} from "db/query"
import { Database as SqlDatabase, layer as sqlLayer } from "db/client"
import { Context, Effect, Layer } from "effect"
import {
    CLANS_RANKINGS_PER_PAGE,
    GLOBAL_PLAYER_RANKINGS_PER_PAGE,
    SEARCH_PLAYERS_ALIASES_PER_PAGE,
} from "@util/constants"
import { bhClan, bhPlayerAlias, bhPlayerData } from "db/schema"
import { DatabaseError } from "./errors"
import type { D1Database } from "db/client"
import type { BHClan, BHPlayerAlias, NewBHClan } from "db/schema"
import type { AliasSearchResult, GlobalPlayerRanking } from "./schemas"

/**
 * Server-side database access.
 *
 * Queries go straight to Cloudflare D1 through Drizzle's Effect integration
 * (`drizzle-orm/effect-d1`) on Effect's own D1 client, so there is no HTTP
 * layer between the server and the database. The client itself is built by
 * `db/client`, which is the single place that knows about the `DB` binding.
 *
 * Text search uses `LIKE 'x%'` (SQLite has no `ILIKE`); the schema carries
 * `COLLATE NOCASE` indexes so the case-insensitive prefix search stays
 * indexed, and one index per ranking column keeps the dynamic `ORDER BY`
 * indexed too.
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
                        const deduped = aliases.filter(
                            (alias, i) =>
                                aliases.findIndex(
                                    (a) =>
                                        a.playerId === alias.playerId &&
                                        a.alias === alias.alias,
                                ) === i,
                        )

                        if (deduped.length === 0) return

                        yield* db
                            .insert(bhPlayerAlias)
                            .values([...deduped])
                            .onConflictDoUpdate({
                                target: [
                                    bhPlayerAlias.playerId,
                                    bhPlayerAlias.alias,
                                ],
                                set: {
                                    createdAt: sql`excluded."createdAt"`,
                                    public: sql`excluded."public"`,
                                },
                            })
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
                        const needle = name.trim().toLowerCase()

                        return yield* db
                            .select()
                            .from(bhClan)
                            .where(
                                needle.length > 0
                                    ? like(bhClan.name, `${needle}%`)
                                    : undefined,
                            )
                            .orderBy(desc(bhClan.xp))
                            .limit(CLANS_RANKINGS_PER_PAGE)
                            .offset((page - 1) * CLANS_RANKINGS_PER_PAGE)
                    }),
                ),

            searchExactAliases: (alias, page) =>
                run(
                    db
                        .select()
                        .from(bhPlayerAlias)
                        .where(
                            like(
                                bhPlayerAlias.alias,
                                alias.trim().toLowerCase(),
                            ),
                        )
                        .orderBy(asc(bhPlayerAlias.alias))
                        .limit(SEARCH_PLAYERS_ALIASES_PER_PAGE)
                        .offset((page - 1) * SEARCH_PLAYERS_ALIASES_PER_PAGE),
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
                        const needle = alias.trim().toLowerCase()

                        if (needle.length < 2) return []

                        // Replaces the old `search_aliases` plpgsql function:
                        // the first page of players whose alias starts with the
                        // needle, then every public alias of those players.
                        const matchingPlayerIds = db
                            .select({ playerId: bhPlayerAlias.playerId })
                            .from(bhPlayerAlias)
                            .where(
                                and(
                                    like(bhPlayerAlias.alias, `${needle}%`),
                                    eq(bhPlayerAlias.public, true),
                                ),
                            )
                            .orderBy(desc(bhPlayerAlias.createdAt))
                            .limit(SEARCH_PLAYERS_ALIASES_PER_PAGE)
                            .offset(
                                (page - 1) * SEARCH_PLAYERS_ALIASES_PER_PAGE,
                            )

                        const rows = yield* db
                            .select()
                            .from(bhPlayerAlias)
                            .where(
                                and(
                                    inArray(
                                        bhPlayerAlias.playerId,
                                        matchingPlayerIds,
                                    ),
                                    eq(bhPlayerAlias.public, true),
                                ),
                            )
                            .orderBy(desc(bhPlayerAlias.createdAt))

                        return rows.reduce((acc, row) => {
                            const player = acc.find(
                                (a) => a.playerId === row.playerId,
                            )

                            if (!player) {
                                acc.push({
                                    playerId: row.playerId,
                                    mainAlias: row.alias,
                                    otherAliases: [],
                                })

                                return acc
                            }

                            if (player.mainAlias !== row.alias) {
                                player.otherAliases.push(row.alias)
                            }

                            return acc
                        }, [] as AliasSearchResult[])
                    }),
                ),
        })
    }),
)

/** Builds the domain service on its own D1 client. */
export const makeLayer = (db: D1Database) =>
    layer.pipe(Layer.provide(sqlLayer(db)))
