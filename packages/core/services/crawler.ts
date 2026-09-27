import { Context, Effect, Layer } from "effect"
import { crawlTargets, playerIdsForRow } from "@crh/bhapi/crawlTargets"
import { Database } from "./archive"
import { Cache } from "./cache"
import { cacheKeys, cacheTtl } from "./cache-policy"
import { Upstream } from "./upstream"
import type { CrawlTarget } from "@crh/bhapi/crawlTargets"
import type { RankedSnapshot } from "./player-writes"
import type {
    PlayerRanked,
    Ranking1v1,
    Ranking2v2,
    Ranking3v3,
} from "@crh/bhapi/types"
import type { RankedRegion, RankedTier } from "@crh/bhapi/constants"

/**
 * Walks every upstream leaderboard and writes the players it finds.
 *
 * Effect-native rather than the previous `while (true)` + `await` loop. The
 * imperative original had three problems that this structure removes:
 *
 * 1. It hard-coded one call — `getRankings("1v1", "all", page)` — so 2v2 and
 *    all nine real regions were never crawled. Targets now come from
 *    `crawlTargets`, so a bracket cannot be missing here without being missing
 *    from the product's own list.
 * 2. Progress was a single `"Crawler"` row, which cannot describe more than one
 *    ladder's position. Each target resumes from its own key.
 * 3. Its resume branch called `return` from inside the run loop when a progress
 *    row existed, so the crawler terminated itself on the second process start
 *    — and re-crawled the same first pages forever otherwise. There is no such
 *    branch here: a target that runs off the end of its ladder wraps to page
 *    one, which is what a continuous crawler should do.
 *
 * Pacing is explicit, because the Brawlhalla key has a shared request budget.
 * The crawler reads through `Upstream` rather than the cached `Brawlhalla`
 * gateway: it is the authoritative refresh path, so a cached page would mean
 * never re-reading the ladder, and the request-path damper would throttle the
 * very work that keeps the tables current.
 */
export type CrawlerConfig = {
    /** Pages to walk per target per pass. */
    readonly pagesPerTarget: number
    /** Spacing between upstream requests, in milliseconds. */
    readonly requestSpacingMs: number
    /** How many of a page's players are in flight at once. */
    readonly playerConcurrency: number
}

/**
 * Defaults sized to the upstream request budget, not to wall-clock speed.
 *
 * The v1 API allows **2,000 requests per 15 minutes**, which is 2.22 req/s —
 * `requestSpacingMs` is the inverse of that and nothing more.
 *
 * What a pass costs depends on the ladder, because a **team row does not carry a
 * player's own rating**:
 *
 * - 1v1 — `1 + players` = 51 requests. The row already holds the player's 1v1
 *   rating, so nothing else is needed.
 * - 2v2 and 3v3 — `1 + 2 × players` = 101. A team rating is not the player's own
 *   1v1 rating, and `BHPlayerData.rating` is the column the 1v1 leaderboard sorts
 *   by, so each player's own ranked record has to be fetched separately. That
 *   doubles the cost of a team page.
 *
 * Over the 30 targets a pass is about 2,530 requests — roughly 19 minutes of
 * paced work. That is why the cron is every 30 minutes rather than every ten:
 * 2,530 per window would be 126% of the allowance and would starve user traffic,
 * while every 30 minutes is ~1,265, about 63%, leaving the rest for requests that
 * miss the cache.
 *
 * Two caveats are worth holding on to:
 *
 * - The limit is **per IP**, and Workers egress from shared Cloudflare IPs. The
 *   budget is therefore not exclusively ours — another tenant on the same egress
 *   IP spends from it too — so pacing to exactly 2,000 would risk 429s rather
 *   than use the allowance efficiently.
 * - Raising `pagesPerTarget` spends the allowance linearly. It does not make the
 *   crawl faster; it makes the same window carry more of the matrix and less of
 *   the user traffic.
 *
 * The obvious saving, not taken yet: a team page only needs the per-player
 * ranked fetch for players we have never seen on a 1v1 ladder. Storing the
 * account stats for an already-known player without re-reading their ranked
 * record would roughly halve the cost of 2v2 and 3v3.
 */
export const defaultCrawlerConfig: CrawlerConfig = {
    pagesPerTarget: 1,
    requestSpacingMs: 450,
    playerConcurrency: 1,
}

/** The ranked facts a 1v1 ladder row already carries for that player. */
const snapshotFromRow = (row: Ranking1v1): RankedSnapshot => ({
    rating: row.rating,
    peak: row.peak_rating,
    games: row.games,
    wins: row.wins,
    tier: row.tier,
    region: row.region.toLowerCase() as RankedRegion,
})

/**
 * The 1v1 snapshot for a player discovered on a **2v2** ladder.
 *
 * A 2v2 row's `rating` is a *team* rating, while `BHPlayerData.rating` is the
 * player's own 1v1 rating — the column the 1v1 leaderboard sorts by and the
 * global rankings read. Writing a team rating into it would corrupt both, so a
 * 2v2 discovery never contributes the row's numbers: the player's own ranked
 * record is fetched instead.
 *
 * A player with no 1v1 record yields `null`. That is not a failure —
 * `rating`/`tier`/`region` are `NOT NULL`, and inventing zeros would insert a
 * player into the 1v1 ladder who is not on it. They are skipped, logged at
 * debug, and picked up by a later 1v1 pass if they ever place.
 */
const snapshotFromRanked = (
    ranked: PlayerRanked | null,
): RankedSnapshot | null =>
    ranked === null
        ? null
        : {
              rating: ranked.rating,
              peak: ranked.peak_rating,
              games: ranked.games,
              wins: ranked.wins,
              tier: ranked.tier as RankedTier,
              region: ranked.region.toLowerCase() as RankedRegion,
          }

export class Crawler extends Context.Service<
    Crawler,
    {
        /** Crawls one page; returns its row count so `0` means "end of ladder". */
        readonly crawlPage: (
            target: CrawlTarget,
            page: number,
            config: CrawlerConfig,
        ) => Effect.Effect<number>
        /** Walks `pagesPerTarget` pages of one target, wrapping at the end. */
        readonly crawlTarget: (
            target: CrawlTarget,
            config: CrawlerConfig,
        ) => Effect.Effect<void>
        /** One pass over every target. */
        readonly crawlAll: (config: CrawlerConfig) => Effect.Effect<void>
    }
>()("app/Crawler") {}

export const layer = Layer.effect(
    Crawler,
    Effect.gen(function* () {
        const upstream = yield* Upstream
        const database = yield* Database
        const cache = yield* Cache

        /**
         * One player: fetch their stats, then write them.
         *
         * `row` is the ladder row that surfaced the player. Only a 1v1 row may
         * supply the ranked snapshot; a 2v2 or 3v3 row's rating belongs to the
         * team, so those ladders fetch the player's own ranked record instead.
         */
        const crawlPlayer = (
            target: CrawlTarget,
            row: Ranking1v1 | Ranking2v2 | Ranking3v3,
            playerId: number,
            config: CrawlerConfig,
        ) =>
            Effect.gen(function* () {
                const stats = yield* upstream.getPlayerStats(playerId)

                if (!stats) return

                // Warm the reader's cache with what we just fetched.
                //
                // The crawler does not *read* through the cache — it is the
                // refresh path, so a cached page would mean never re-reading the
                // ladder — but writing to it means the requests it already paid
                // for are served without spending the budget again. The key and
                // window come from `cache-policy`, which is the same source the
                // gateway reads with, so a warm entry is one the gateway will
                // actually find.
                yield* cache.set(
                    cacheKeys.player(playerId),
                    stats,
                    cacheTtl.profile,
                )

                const ranked =
                    target.bracket === "1v1"
                        ? snapshotFromRow(row as Ranking1v1)
                        : snapshotFromRanked(
                              yield* upstream.getPlayerRanked(playerId),
                          )

                if (!ranked) {
                    yield* Effect.logDebug(
                        `player ${playerId} has no 1v1 record; skipping ` +
                            `rather than writing a placeholder`,
                    )

                    return
                }

                yield* database.upsertPlayerStats(stats, ranked)
            }).pipe(
                // One bad player must not end the pass.
                Effect.catch((error) =>
                    Effect.logWarning(
                        `crawl failed for player ${playerId}`,
                        error,
                    ),
                ),
                Effect.delay(config.requestSpacingMs),
            )

        const crawlPage: Context.Service.Shape<typeof Crawler>["crawlPage"] = (
            target,
            page,
            config,
        ) =>
            Effect.gen(function* () {
                const rows = yield* upstream.getRankings(
                    target.bracket,
                    target.region,
                    page,
                )

                if (rows.length === 0) return 0

                // Non-empty pages only. An empty page is either the end of the
                // ladder or a transient upstream failure, and caching the
                // latter would hand the gateway an empty ladder for the whole
                // freshness window — the one cache entry that would be worse
                // than a miss.
                yield* cache.set(
                    cacheKeys.leaderboard(target.bracket, target.region, page),
                    rows,
                    cacheTtl.leaderboard,
                )

                yield* Effect.forEach(
                    rows,
                    (row) =>
                        Effect.forEach(
                            playerIdsForRow(
                                target.bracket,
                                row as Ranking1v1 | Ranking2v2 | Ranking3v3,
                            ),
                            (playerId) =>
                                crawlPlayer(
                                    target,
                                    row as Ranking1v1 | Ranking2v2 | Ranking3v3,
                                    playerId,
                                    config,
                                ),
                            { concurrency: 1 },
                        ),
                    { concurrency: config.playerConcurrency },
                )

                return rows.length
            }).pipe(
                // A failed page must not end the pass; the next one may work.
                Effect.catch((error) =>
                    Effect.logWarning(
                        `crawl failed for ${target.label} page ${page}`,
                        error,
                    ).pipe(Effect.as(0)),
                ),
            )

        const crawlTarget: Context.Service.Shape<
            typeof Crawler
        >["crawlTarget"] = (target, config) =>
            Effect.gen(function* () {
                const resume = yield* database
                    .getCrawlProgress(target.id)
                    .pipe(Effect.catch(() => Effect.succeed(null)))

                const start = resume ?? 1

                yield* Effect.logInfo(
                    `crawling ${target.label} from page ${start}`,
                )

                for (
                    let page = start;
                    page < start + config.pagesPerTarget;
                    page++
                ) {
                    const rowCount = yield* crawlPage(target, page, config)

                    if (rowCount === 0) {
                        // Off the end of the ladder: wrap, so a continuous
                        // crawler keeps the top of the table fresh instead
                        // of stalling past the last page forever.
                        yield* database
                            .setCrawlProgress(target.id, target.label, 1)
                            .pipe(
                                Effect.catch(() =>
                                    Effect.logWarning(
                                        `could not wrap progress for ` +
                                            `${target.label}`,
                                    ),
                                ),
                            )

                        yield* Effect.logInfo(
                            `${target.label} exhausted at page ${page}; ` +
                                `wrapping to 1`,
                        )

                        return
                    }

                    yield* database
                        .setCrawlProgress(target.id, target.label, page + 1)
                        .pipe(
                            Effect.catch(() =>
                                Effect.logWarning(
                                    `could not record progress for ` +
                                        `${target.label}`,
                                ),
                            ),
                        )
                }
            })

        return {
            crawlPage,
            crawlTarget,

            crawlAll: (config) =>
                Effect.gen(function* () {
                    yield* Effect.logInfo(
                        `crawl pass over ${crawlTargets.length} targets`,
                    )

                    // Sequential: the constraint is the shared upstream budget,
                    // so overlapping targets would only contend for it.
                    for (const target of crawlTargets) {
                        yield* crawlTarget(target, config)
                    }
                }),
        }
    }),
)
