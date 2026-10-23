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
    AliasSearchResultInput,
    CareerRankingInput,
} from "@crh/api-contract/schemas"

/** Nine rows × ~10 params must stay under D1's 100 bound-param limit. */
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

        /** clan_xp for profile cards; null if we have never indexed the clan. */
        readonly getClanXp: (
            clanId: string,
        ) => Effect.Effect<string | null, DatabaseError>

        readonly searchExactAliases: (
            alias: string,
            page: number,
        ) => Effect.Effect<readonly BHPlayerAlias[], DatabaseError>
        readonly getGlobalPlayerRankings: (
            sortBy: string,
            page: number,
        ) => Effect.Effect<readonly CareerRankingInput[], DatabaseError>

        readonly getGlobalLegendRankings: (
            legendId: number,
            sortBy: string,
            page: number,
        ) => Effect.Effect<readonly CareerRankingInput[], DatabaseError>

        readonly getGlobalWeaponRankings: (
            weapon: string,
            sortBy: string,
            page: number,
        ) => Effect.Effect<readonly CareerRankingInput[], DatabaseError>

        readonly getBestLegends: (
            playerIds: readonly string[],
        ) => Effect.Effect<readonly BestLegendRow[], DatabaseError>
        readonly searchAliases: (
            alias: string,
            page: number,
        ) => Effect.Effect<readonly AliasSearchResultInput[], DatabaseError>

        readonly upsertPlayerStats: (
            playerStats: PlayerStats,

            ranked: RankedSnapshot | null,
        ) => Effect.Effect<void, DatabaseError>

        readonly upsertPlayerRanked: (
            player: { readonly id: string; readonly name: string },
            ranked: RankedSnapshot,
        ) => Effect.Effect<void, DatabaseError>

        readonly upsertRankedQueue: (
            rows: readonly NewBHRankedQueue[],
        ) => Effect.Effect<void, DatabaseError>

        readonly pruneRankedQueue: (
            bracket: string,
            region: string,
            before: Date,
        ) => Effect.Effect<void, DatabaseError>
        readonly getRankedQueue: (
            bracket: string,
            region: string,
            queuedSince: Date,
        ) => Effect.Effect<readonly BHRankedQueue[], DatabaseError>

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

export const searchKey = (value: string): string => value.trim().toLowerCase()

export type BestLegendRow = {
    readonly playerId: string
    readonly legendId: number
    readonly games: number
    readonly wins: number
}

/** Half-open [prefix, nextCodePoint); undefined if no upper bound exists. */
const prefixRange = (
    prefix: string,
): { readonly from: string; readonly to: string } | undefined => {
    if (prefix.length === 0) return undefined

    const lastCodePoint = prefix.codePointAt(prefix.length - 1)

    if (lastCodePoint === undefined || lastCodePoint >= 0xffff) return undefined

    return {
        from: prefix,
        to: prefix.slice(0, -1) + String.fromCodePoint(lastCodePoint + 1),
    }
}

/** Refuse pages past SEARCH_MAX_PAGES — OFFSET cost grows with page number. */
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

const byXpDesc = (a: BHClan, b: BHClan): number => b.xp - a.xp

const isPrefixOf = (column: SQLWrapper, prefix: string) => {
    const range = prefixRange(prefix)

    return range === undefined
        ? sql`${column} >= ${prefix}`
        : sql`${column} >= ${range.from} AND ${column} < ${range.to}`
}

const run = <A, E, R>(
    effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, DatabaseError, R> =>
    effect.pipe(Effect.mapError((cause) => new DatabaseError({ cause })))

/** Requires SqlDatabase in context; use makeLayer(db) for a self-contained layer. */
export const layer = Layer.effect(
    Database,
    Effect.gen(function* () {
        const db = yield* SqlDatabase

        const playerColumns = getTableColumns(bhPlayerData)

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

                                set: excludedSet(
                                    playerData,
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
                        const row = toPlayerRankedRow(player, ranked)

                        yield* db
                            .insert(bhPlayerData)
                            .values(row)
                            .onConflictDoUpdate({
                                target: bhPlayerData.id,

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
                                        // Stamp queuedAt only when games increase (WHERE below).
                                        queuedAt: sql`excluded."lastUpdated"`,
                                        // Zero baseline is not a real previous value — do not invent a delta.
                                        ratingDelta: sql`CASE WHEN ${bhRankedQueue.rating} = 0 THEN 0 ELSE excluded."rating" - ${bhRankedQueue.rating} END`,
                                        rankDelta: sql`CASE WHEN ${bhRankedQueue.rank} = 0 THEN 0 ELSE excluded."rank" - ${bhRankedQueue.rank} END`,
                                    },
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

                                region === "all"
                                    ? undefined
                                    : eq(bhRankedQueue.region, region),
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

                        const deduped = [
                            ...new Map(
                                aliases.map((alias) => [
                                    `${alias.playerId}\u0000${alias.alias}`,
                                    alias,
                                ]),
                            ).values(),
                        ]

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

                        if (needle.length === 0) {
                            return yield* db
                                .select()
                                .from(bhClan)
                                .orderBy(desc(bhClan.xp))
                                .limit(CLANS_RANKINGS_PER_PAGE)
                                .offset(offset)
                        }

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

            getBestLegends: (playerIds) =>
                run(
                    Effect.gen(function* () {
                        if (playerIds.length === 0) return []

                        const rows = yield* db
                            .select({
                                playerId: bhPlayerLegend.player_id,
                                legendId: bhPlayerLegend.legend_id,
                                games: bhPlayerLegend.games,
                                wins: bhPlayerLegend.wins,
                            })
                            .from(bhPlayerLegend)
                            .where(
                                inArray(bhPlayerLegend.player_id, [
                                    ...playerIds,
                                ]),
                            )

                        return rows
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

                        const results: AliasSearchResultInput[] = []
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

export const makeLayer = (db: D1Database) =>
    layer.pipe(Layer.provide(sqlLayer(db)))
