import { and, asc, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm"
import { Database as SqlDatabase, layer as sqlLayer } from "db/client"
import { Context, Effect, Layer } from "effect"
import {
    CLANS_RANKINGS_PER_PAGE,
    GLOBAL_PLAYER_RANKINGS_PER_PAGE,
    SEARCH_PLAYERS_ALIASES_PER_PAGE,
} from "@util/constants"
import { bhClan, bhPlayerAlias, bhPlayerData } from "db/schema"
import { DatabaseError } from "./errors"
import type { BHClan, BHPlayerAlias, NewBHClan } from "db/schema"
import type { AliasSearchResult, GlobalPlayerRanking } from "./schemas"

/**
 * Server-side database access.
 *
 * Queries go straight to Postgres through Drizzle's Effect integration
 * (`drizzle-orm/effect-postgres`) on Effect's own PostgreSQL client, so there
 * is no HTTP layer between the server and the database. The pool itself is
 * built by `db/client`, which is the single place that knows the connection
 * settings.
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
 * The domain service, built on whatever `SqlDatabase` pool is in context.
 *
 * Splitting the pool out lets `Server.ts` build one pool and share it between
 * the stats services and `Auth`; `makeLayer` is the convenience wrapper for
 * one-off server routes.
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
                    db
                        .select()
                        .from(bhClan)
                        // A bind parameter, so the PostgREST-era quote
                        // escaping for the filter string is gone.
                        .where(
                            name.trim().length > 0
                                ? ilike(bhClan.name, `${name.trim()}%`)
                                : undefined,
                        )
                        .orderBy(desc(bhClan.xp))
                        .limit(CLANS_RANKINGS_PER_PAGE)
                        .offset((page - 1) * CLANS_RANKINGS_PER_PAGE),
                ),

            searchExactAliases: (alias, page) =>
                run(
                    db
                        .select()
                        .from(bhPlayerAlias)
                        .where(eq(bhPlayerAlias.alias, alias))
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
                        if (alias.length < 2) return []

                        // Reaches the `search_aliases` SQL function
                        // installed by `packages/db/sql/functions.sql`.
                        const rows = yield* db.execute<BHPlayerAlias>(
                            sql`
                                    select * from search_aliases(
                                        ${alias.trim()},
                                        ${(page - 1) * SEARCH_PLAYERS_ALIASES_PER_PAGE},
                                        ${SEARCH_PLAYERS_ALIASES_PER_PAGE}
                                    )
                                `,
                            // Decode rows as objects; the RC types
                            // `execute` results as `unknown` without an
                            // explicit mode.
                            "objects",
                        )

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

/** Builds the domain service on its own pool for one connection URL. */
export const makeLayer = (
    url: string = globalThis.process?.env?.DATABASE_URL ?? "",
) => layer.pipe(Layer.provide(sqlLayer(url)))
