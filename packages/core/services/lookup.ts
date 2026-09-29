import { Context, Effect, Layer } from "effect"
import { Database, searchKey } from "./archive"
import { Upstream } from "./upstream"
import { MIN_LOOKUP_LENGTH } from "@crh/api-contract/schemas"
import type { LookupResultInput } from "@crh/api-contract/schemas"
import type { Ranking1v1, Ranking2v2 } from "@crh/bhapi/types"

/**
 * The federated player/clan lookup.
 *
 * ## Why it federates
 *
 * No single source can answer "find this player" completely:
 *
 * | Source | Knows | Cannot know |
 * | --- | --- | --- |
 * | v1 rankings `?search=` | every ranked player on that ladder, across every region in one request via `region=ALL` | former names; players who never placed |
 * | local alias index | former names, and players seen by the crawler | anyone never crawled |
 * | local clan index | clan names | — there is no upstream clan name search |
 *
 * The upstream ladder search is the broad one, and `region=ALL` is what makes it
 * a single request rather than one per region. It is also the source that
 * matters most, because it is the only one that can find a player we have never
 * seen.
 *
 * ## Both ranked modes, deliberately
 *
 * `1v1` and `2v2` are searched, not just `1v1`. A player who has only ever
 * placed in 2v2 is invisible to a 1v1 ladder search, which would make the lookup
 * silently miss a whole class of player. The cost is one extra request per
 * submit, which is affordable now that the budget is 2,000 per 5 minutes — and
 * unlike the crawler this runs per user search, not continuously.
 *
 * ## Degrading, never failing
 *
 * Each source fails soft. A lookup is a jump-to-result interaction: returning
 * the local matches is far better than returning an error because the upstream
 * call timed out.
 */

/** Below this, a search is not worth a request. */
export { MIN_LOOKUP_LENGTH }

/** How many rows the merged list returns when no limit is given. */
export const DEFAULT_LOOKUP_LIMIT = 20

/** A player row from the rankings search. */
export type PlayerHit = {
    readonly playerId: string
    readonly name: string
    readonly rating: number | null
    readonly tier: string | null
    readonly region: string | null
}

/** A clan row from the local index. */
export type ClanHit = {
    readonly id: string
    readonly name: string
    readonly xp: number
}

/** A local alias row: the only source of former names. */
export type AliasHit = {
    readonly playerId: string
    readonly mainAlias: string
    readonly otherAliases: readonly string[]
}

/**
 * How well a name matches the query.
 *
 * `0` exact, `1` prefix, `2` anything else. The match is case- and
 * whitespace-folded through `searchKey`, the same folding the stored keys use,
 * so a query and a stored name can never disagree about case.
 */
export const matchTier = (query: string, name: string): number => {
    const needle = searchKey(query)
    const haystack = searchKey(name)

    if (needle.length === 0) return 2
    if (haystack === needle) return 0
    if (haystack.startsWith(needle)) return 1

    return 2
}

/**
 * The best match tier across a result's display name and its aliases.
 *
 * Ranking on the display name alone would push a player whose *old* name
 * matched exactly down to "anything else", which is exactly backwards: the
 * alias hit is the more specific answer.
 */
const bestTier = (query: string, result: LookupResultInput): number =>
    result.aliases.reduce(
        (best, alias) => Math.min(best, matchTier(query, alias)),
        matchTier(query, result.name),
    )

/**
 * Orders the merged list.
 *
 * Match quality first, then name length (a shorter name matching the prefix is
 * the closer answer), then prominence within a type. There is deliberately no
 * cross-type prominence comparison: a player's rating and a clan's XP are not
 * commensurable, so ordering a player against a clan by either number would be
 * arbitrary. Ties across types fall through to the name.
 */
const compare =
    (query: string) =>
    (a: LookupResultInput, b: LookupResultInput): number => {
        const tier = bestTier(query, a) - bestTier(query, b)
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
 * Merges the three sources into one ranked list.
 *
 * Pure, so the ranking rules can be read and tested without a network or a
 * database.
 *
 * Players are deduplicated by id with **first occurrence winning**, which is why
 * the caller passes `1v1` hits before `2v2` hits: a player on both ladders
 * should be described by their own 1v1 rating, not by a team rating.
 *
 * A player known only to the alias index has no rating — they have never been
 * seen on a ladder — and is emitted with `rating: null` and its aliases intact,
 * because the old name is the only reason it is in the result at all.
 */
export const mergeLookup = (input: {
    readonly query: string
    readonly players: readonly PlayerHit[]
    readonly aliases: readonly AliasHit[]
    readonly clans: readonly ClanHit[]
    readonly limit: number
}): readonly LookupResultInput[] => {
    const playersById = new Map<string, { hit: PlayerHit; aliases: string[] }>()

    for (const hit of input.players) {
        if (playersById.has(hit.playerId)) continue

        playersById.set(hit.playerId, { hit, aliases: [] })
    }

    for (const alias of input.aliases) {
        const known = playersById.get(alias.playerId)

        if (known) {
            known.aliases.push(alias.mainAlias, ...alias.otherAliases)
            continue
        }

        playersById.set(alias.playerId, {
            hit: {
                playerId: alias.playerId,
                name: alias.mainAlias,
                rating: null,
                tier: null,
                region: null,
            },
            aliases: [...alias.otherAliases],
        })
    }

    const results: LookupResultInput[] = [
        ...[...playersById.values()].map(({ hit, aliases }): LookupResultInput => ({
            type: "player",
            id: hit.playerId,
            name: hit.name,
            // Dedupe: a player's current name can also appear in their
            // alias list, and repeating it reads as a different person.
            aliases: [
                ...new Set(
                    aliases.filter(
                        (alias) => searchKey(alias) !== searchKey(hit.name),
                    ),
                ),
            ],
            rating: hit.rating,
            xp: null,
            tier: hit.tier,
            region: hit.region,
            source: hit.rating === null ? "archive" : "rankings",
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
        /** Never fails: each source degrades to "no results". */
        readonly search: (
            query: string,
            limit?: number,
        ) => Effect.Effect<readonly LookupResultInput[]>
    }
>()("app/Lookup") {}

export const layer = Layer.effect(
    Lookup,
    Effect.gen(function* () {
        const upstream = yield* Upstream
        const database = yield* Database

        /**
         * A source that fails is a source with no results, not an error.
         *
         * Generic over the error type because the archive's queries carry
         * `DatabaseError` while the upstream ones do not; both collapse to an
         * empty list here.
         */
        const soft = <A, E>(effect: Effect.Effect<A, E>) =>
            effect.pipe(Effect.catch(() => Effect.succeed([] as A)))

        return {
            search: (query, limit = DEFAULT_LOOKUP_LIMIT) =>
                Effect.gen(function* () {
                    if (searchKey(query).length < MIN_LOOKUP_LENGTH) return []

                    const [oneVsOne, twoVsTwo, aliases, clans] =
                        yield* Effect.all(
                            [
                                soft(
                                    upstream.getRankings(
                                        "1v1",
                                        "all",
                                        1,
                                        query,
                                    ),
                                ),
                                soft(
                                    upstream.getRankings(
                                        "2v2",
                                        "all",
                                        1,
                                        query,
                                    ),
                                ),
                                soft(database.searchAliases(query, 1)),
                                soft(database.getClansRankings(query, 1)),
                            ],
                            { concurrency: 4 },
                        )

                    // `getRankings` returns the union of both row shapes — the
                    // bracket argument does not narrow it — so the two results
                    // are asserted here, where the bracket is a literal.
                    const oneVsOneRows = oneVsOne as readonly Ranking1v1[]
                    const twoVsTwoRows = twoVsTwo as readonly Ranking2v2[]

                    // 1v1 first so its rows win the dedupe: a player's own
                    // rating describes them, a 2v2 team rating does not.
                    const players: PlayerHit[] = [
                        ...oneVsOneRows.map((row) => ({
                            playerId: String(row.brawlhalla_id),
                            name: row.name,
                            rating: row.rating,
                            tier: row.tier,
                            region: row.region,
                        })),
                        ...twoVsTwoRows.flatMap((row) => {
                            // A 2v2 row is a team; both members are candidates
                            // and neither has a usable personal rating here.
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
                        aliases,
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
