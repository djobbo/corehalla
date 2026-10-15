import { Context, Effect, Layer } from "effect"
import { Database, searchKey } from "./archive"
import { Upstream } from "./upstream"
import { MIN_LOOKUP_LENGTH } from "@crh/api-contract/schemas"
import type { LookupResultInput } from "@crh/api-contract/schemas"
import type { RankedRegion } from "@crh/bhapi/constants"
import type { Ranking1v1, Ranking2v2 } from "@crh/bhapi/types"

export { MIN_LOOKUP_LENGTH }

export const DEFAULT_LOOKUP_LIMIT = 20

export type PlayerHit = {
    readonly playerId: string
    readonly name: string
    readonly rating: number | null
    readonly tier: string | null
    readonly region: string | null
}

export type ClanHit = {
    readonly id: string
    readonly name: string
    readonly xp: number
}

/** 0 exact, 1 prefix, 2 other — via searchKey so case/whitespace match storage. */
export const matchTier = (query: string, name: string): number => {
    const needle = searchKey(query)
    const haystack = searchKey(name)

    if (needle.length === 0) return 2
    if (haystack === needle) return 0
    if (haystack.startsWith(needle)) return 1

    return 2
}

/** Match quality, then name length; no cross-type prominence (rating ≠ xp). */
const compare =
    (query: string) =>
    (a: LookupResultInput, b: LookupResultInput): number => {
        const tier = matchTier(query, a.name) - matchTier(query, b.name)
        if (tier !== 0) return tier

        if (a.name.length !== b.name.length) {
            return a.name.length - b.name.length
        }

        if (a.type === b.type) {
            const prominenceA =
                a.type === "player" ? (a.rating ?? 0) : (a.xp ?? 0)
            const prominenceB =
                b.type === "player" ? (b.rating ?? 0) : (b.xp ?? 0)

            if (prominenceA !== prominenceB) return prominenceB - prominenceA
        }

        return a.name.localeCompare(b.name)
    }

/**
 * The leaderboard lookup: players from the ranked ladders plus clans from the
 * guild table. Archived/alias-only players come from a second, separate
 * lookup (`searchPlayerAlias`), so a slow alias scan never delays these — and
 * nothing here is marked archival.
 */
export const mergeLookup = (input: {
    readonly query: string
    readonly players: readonly PlayerHit[]
    readonly clans: readonly ClanHit[]
    readonly limit: number
}): readonly LookupResultInput[] => {
    // First id wins — pass 1v1 before 2v2 so personal rating beats team rating.
    const playersById = new Map<string, PlayerHit>()

    for (const hit of input.players) {
        if (!playersById.has(hit.playerId)) playersById.set(hit.playerId, hit)
    }

    const results: LookupResultInput[] = [
        ...[...playersById.values()].map((hit): LookupResultInput => ({
            type: "player",
            id: hit.playerId,
            name: hit.name,
            aliases: [],
            rating: hit.rating,
            xp: null,
            tier: hit.tier,
            region: hit.region,
            source: "rankings",
        })),
        ...input.clans.map((clan): LookupResultInput => ({
            type: "clan",
            id: clan.id,
            name: clan.name,
            aliases: [],
            rating: null,
            xp: clan.xp,
            tier: null,
            region: null,
            source: "archive",
        })),
    ]

    return results.sort(compare(input.query)).slice(0, input.limit)
}

export class Lookup extends Context.Service<
    Lookup,
    {
        readonly search: (
            query: string,
            limit?: number,
            region?: RankedRegion,
        ) => Effect.Effect<readonly LookupResultInput[]>
    }
>()("app/Lookup") {}

export const layer = Layer.effect(
    Lookup,
    Effect.gen(function* () {
        const upstream = yield* Upstream
        const database = yield* Database

        const soft = <A, E>(effect: Effect.Effect<A, E>) =>
            effect.pipe(Effect.catch(() => Effect.succeed([] as A)))

        return {
            search: (query, limit = DEFAULT_LOOKUP_LIMIT, region = "all") =>
                Effect.gen(function* () {
                    if (searchKey(query).length < MIN_LOOKUP_LENGTH) return []

                    const [oneVsOne, twoVsTwo, clans] = yield* Effect.all(
                        [
                            soft(upstream.getRankings("1v1", region, 1, query)),
                            soft(upstream.getRankings("2v2", region, 1, query)),
                            soft(database.getClansRankings(query, 1)),
                        ],
                        { concurrency: 3 },
                    )

                    // Bracket does not narrow the union — assert at the literal.
                    const oneVsOneRows = oneVsOne as readonly Ranking1v1[]
                    const twoVsTwoRows = twoVsTwo as readonly Ranking2v2[]

                    // 1v1 first so personal rating wins dedupe over 2v2 team rating.
                    const players: PlayerHit[] = [
                        ...oneVsOneRows.map((row) => ({
                            playerId: String(row.brawlhalla_id),
                            name: row.name,
                            rating: row.rating,
                            tier: row.tier,
                            region: row.region,
                        })),
                        ...twoVsTwoRows.flatMap((row) => {
                            const members = [
                                {
                                    playerId: String(row.brawlhalla_id_one),
                                    name: row.name_one,
                                },
                                {
                                    playerId: String(row.brawlhalla_id_two),
                                    name: row.name_two,
                                },
                            ]

                            return members
                                .filter(
                                    (member) =>
                                        member.playerId !== "0" &&
                                        member.name.length > 0,
                                )
                                .map((member) => ({
                                    playerId: member.playerId,
                                    name: member.name,
                                    rating: null,
                                    tier: null,
                                    region: null,
                                }))
                        }),
                    ]

                    return mergeLookup({
                        query,
                        players,
                        clans: clans.map((clan) => ({
                            id: clan.id,
                            name: clan.name,
                            xp: clan.xp,
                        })),
                        limit,
                    })
                }),
        }
    }),
)
