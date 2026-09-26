import { Context, Effect, Layer } from "effect"
import { HttpClient } from "effect/unstable/http"
import { legacyOps } from "./legacy"
import { isCompleteClan, toClan, v1Ops } from "./v1"
import type {
    Bracket,
    Clan,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
} from "@crh/bhapi/types"
import type { RankedRegion } from "@crh/bhapi/constants"

/**
 * The single upstream entry point.
 *
 * ## Which API serves which operation
 *
 * v1 is preferred wherever it can produce a **complete** domain object. Where it
 * cannot, the operation stays on v0 — and it stays there *without probing v1
 * first*, because a probe would double the upstream request for every call and
 * spend the shared rate-limit budget on a result already known to be unusable.
 * Each rejection below is a measured gap, not a guess:
 *
 * | Operation         | Source | Why not the other one |
 * | ----------------- | ------ | --------------------- |
 * | `getClan`         | v1     | Lossless: `/guild/stats` + `/guild/members` covers every field `Clan` has. Costs 2 requests instead of v0's 1, accepted because it is a page-level call. |
 * | `getRankings`     | v0     | v1 rows carry no `best_legend` (or `best_legend_games`/`_wins`), which the leaderboard renders as the legend icon; 2v2 rows likewise have no `teamname`. Adopting v1 would silently drop the icon. |
 * | `getPlayerStats`  | v0     | v1 moved the clan to `/player/guild`, which does not carry `clan_xp` — and `clan_xp` is rendered and parsed (`ClanContent`, the clan upsert). Serving a profile from v1 needs `player/stats` + `player/guild` + `guild/stats`: 3 requests where v0 needs 1. |
 * | `getPlayerRanked` | v0     | v1's `mode` vocabulary is `all`/`ranked_1v1`/`ranked_3v3`. There is no 2v2 mode at all, so the profile's "2v2 Ranked" tab has no v1 source. |
 *
 * The gap that closes each one is a *field*, so the predicates are written
 * against mapped domain objects: filling `best_legend` from the local
 * `BHPlayerLegend` archive, or `clan_xp` from the `BHClan` table, is all it
 * takes to move an operation across without touching its callers.
 *
 * `getClan` therefore also demonstrates the fallback path end to end: v1 is
 * tried, mapped, and rejected if it cannot answer, and v0 covers it.
 */
export class Brawlhalla extends Context.Service<
    Brawlhalla,
    {
        readonly getRankings: (
            bracket: Bracket,
            region: RankedRegion,
            page: number,
            name?: string,
        ) => Effect.Effect<readonly (Ranking1v1 | Ranking2v2)[]>
        readonly getPlayerStats: (
            playerId: number,
        ) => Effect.Effect<PlayerStats | null>
        readonly getPlayerRanked: (
            playerId: number,
        ) => Effect.Effect<PlayerRanked | null>
        readonly getClan: (clanId: number) => Effect.Effect<Clan | null>
    }
>()("app/Brawlhalla") {}

export const layer = Layer.effect(
    Brawlhalla,
    Effect.gen(function* () {
        // Capture the client so the effects this service returns have no
        // remaining requirements.
        const client = yield* HttpClient.HttpClient

        const legacy = legacyOps(client)
        const v1 = v1Ops(client)

        return {
            getRankings: legacy.getRankings,
            getPlayerStats: legacy.getPlayerStats,
            getPlayerRanked: legacy.getPlayerRanked,

            getClan: (clanId) =>
                Effect.gen(function* () {
                    const [guild, members] = yield* Effect.all(
                        [
                            v1.getGuildStats(clanId),
                            v1.getGuildMembers(clanId),
                        ],
                        { concurrency: 2 },
                    )

                    const clan = guild
                        ? toClan(guild, members?.guild_members ?? [])
                        : null

                    if (isCompleteClan(clan)) return clan

                    // A null guild is ambiguous: it is either "v1 does not know
                    // this guild" or "v1 failed" (`getOptionalJson` collapses
                    // transport errors and 404s alike). v0 answers both cases in
                    // one request, so it takes the request rather than us
                    // guessing — a wrong `null` here would be a 404 on a guild
                    // page that exists.
                    yield* Effect.logDebug(
                        `v1 could not serve guild ${clanId}; falling back to v0`,
                    )

                    return yield* legacy.getClan(clanId)
                }),
        }
    }),
)
