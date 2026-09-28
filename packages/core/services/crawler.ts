import { Context, Effect, Layer } from "effect"
import { crawlTargets, playerIdsForRow } from "@crh/bhapi/crawlTargets"
import { Database } from "./archive"
import { toRankedQueueRows } from "./player-writes"
import { RANKED_QUEUE_RETENTION_MS } from "../constants"
import { Cache } from "./cache"
import { cacheKeys, cacheTtl } from "./cache-policy"
import { Upstream } from "./upstream"
import type { CrawlTarget } from "@crh/bhapi/crawlTargets"
import { snapshotFromRanked } from "./player-writes"
import type { RankedSnapshot } from "./player-writes"
import type { Ranking1v1, Ranking2v2, Ranking3v3 } from "@crh/bhapi/types"
import type { RankedRegion } from "@crh/bhapi/constants"

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
 *    one, which is what a continuous crawler should do — and so does one that
 *    reaches `maxPage`, so the walk stays inside the depth the product covers
 *    rather than walking a long ladder to its end once and never returning to
 *    the top.
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
    /**
     * The deepest page the full walk visits, per target.
     *
     * At 50 rows a page this is the top 2,500 of a ladder. The walk wraps to
     * page one once it has fetched this page rather than continuing until an
     * empty page stops it, so a ladder longer than the cap is still re-walked
     * from the top instead of being walked to its end once and never revisited.
     *
     * It is not the sampler's depth — see {@link queuePagesPerTarget}, which is
     * an order of magnitude shallower and has its own queue.
     */
    readonly maxPage: number
    /** Spacing between upstream requests, in milliseconds. */
    readonly requestSpacingMs: number
    /** How many of a page's players are in flight at once. */
    readonly playerConcurrency: number
    /**
     * How deep the activity sampler walks each ladder.
     *
     * Ten pages is the top 500. It costs one request per page per ladder —
     * 270 for the 27 per-region ladders — and nothing per player, because the
     * sampler reads only the ladder.
     *
     * That is a tenth of a full crawl's ~2,530 requests, on a cadence three
     * times as frequent, so the sampler stays the cheap half. The depth is the
     * only dial that matters: the sampler is O(pages) and O(1) per player, so
     * doubling it doubles 270 requests, not 13,500.
     */
    readonly queuePagesPerTarget: number
}

/**
 * Defaults sized to the upstream request budget, not to wall-clock speed.
 *
 * The v1 API allows **2,000 requests per 5 minutes** (Brawlhalla's own developer
 * FAQ), which is 6.67 req/s. `requestSpacingMs` is the inverse of a *share* of
 * that and nothing more.
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
 * Those counts hold only because the crawl reads **career stats alone** — see
 * `Upstream.getPlayerStats` and the `withClan` option `crawlPlayer` passes. A
 * profile read also assembles the clan card, which is a second request per
 * player that the archive discards; paying it here is what silently made a pass
 * 4,030 requests and put the crawl's consumer over a single invocation's worth
 * of work per interval.
 *
 * Over the 30 targets a pass is about 2,530 requests. At 225ms that is 4.44
 * req/s — two thirds of the allowance — and a pass takes about 9.5 minutes of
 * paced work on a 30-minute cron. Spread over the window that cadence spends
 * only ~422 requests per 5 minutes, about 21% of the budget, because the crawl
 * is idle for the other two thirds of the interval. 450ms was the same pass in
 * ~19 minutes; the budget was never what made that slow, so halving the spacing
 * halves the pass without moving the average spend much.
 *
 * Two caveats are worth holding on to:
 *
 * - The limit is **per IP**, and Workers egress from shared Cloudflare IPs. The
 *   budget is therefore not exclusively ours — another tenant on the same egress
 *   IP spends from it too. That is affordable at 4.44 req/s against 6.67, but it
 *   is the reason not to raise the rate further on the strength of our own usage
 *   alone.
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
    maxPage: 50,
    requestSpacingMs: 225,
    playerConcurrency: 1,
    queuePagesPerTarget: 10,
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
 * The 1v1 snapshot for a player discovered on a **2v2** or **3v3** ladder.
 *
 * A 2v2 row's `rating` is a *team* rating, while `BHPlayerData.rating` is the
 * player's own 1v1 rating — the column the 1v1 leaderboard sorts by and the
 * global rankings read. Writing a team rating into it would corrupt both, so a
 * team-ladder discovery never contributes the row's numbers: the player's own
 * ranked record is fetched instead.
 *
 * `snapshotFromRanked` itself now lives in `player-writes`, because the
 * profile's ranked endpoint reaches the same mapping directly and the two must
 * agree on what a stored rating means.
 */
/**
 * The whole cause chain, as one line.
 *
 * `Effect.logWarning(message, error)` attaches the error as an annotation, and
 * the console formatter elides nested causes to `[Array]` — so a database
 * failure logs a 4,000-character SQL statement and the *reason* it failed is
 * the one thing missing. Every layer between here and SQLite wraps what it
 * caught, so the useful text is always at the bottom of the chain.
 */
const describeError = (error: unknown): string => {
    const parts: string[] = []
    let current: unknown = error

    for (let depth = 0; depth < 8; depth++) {
        if (!(current instanceof Error)) break

        if (current.message) parts.push(current.message)
        current = current.cause
    }

    return parts.length > 0 ? parts.join(" <- ") : String(error)
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
        /**
         * Walks `pagesPerTarget` pages of one target from its cursor, wrapping
         * to page one at `maxPage` or at the end of the ladder, whichever comes
         * first.
         */
        readonly crawlTarget: (
            target: CrawlTarget,
            config: CrawlerConfig,
        ) => Effect.Effect<void>
        /** One pass over every target. */
        readonly crawlAll: (config: CrawlerConfig) => Effect.Effect<void>
        /**
         * Samples one ladder's top for activity, fetching no player at all.
         *
         * This is the cheap half of the crawler and the reason a ten-minute
         * refresh is affordable. Everything the ranked queue needs — `games`,
         * `rating`, `tier` — is already on the ladder row, so the pass costs one
         * request per page and nothing per player. The expensive per-player
         * stats crawl is a separate, slower schedule; this only answers "who
         * played since we last looked".
         *
         * Returns the rows sampled, for logging.
         */
        readonly sampleQueue: (
            target: CrawlTarget,
            config: CrawlerConfig,
        ) => Effect.Effect<number>
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
                /*
                 * Career stats only. The clan card is the profile's, and asking
                 * for it here spends a second upstream request per player on a
                 * value the archive write below discards — see
                 * `Upstream.getPlayerStats`. That one option is what puts a
                 * ladder pass back at the ~2,530 requests the budget assumes.
                 */
                const stats = yield* upstream.getPlayerStats(playerId, {
                    withClan: false,
                })

                if (!stats) return

                /*
                 * Deliberately *not* warming `cacheKeys.player` from here.
                 *
                 * A crawl-only read carries no clan card, and the profile
                 * gateway cannot tell a clan-less entry from a player who has no
                 * clan: it would serve the card's absence for the entry's whole
                 * freshness window. Warming it properly needs the very request
                 * this path just stopped paying, and the trade is a bad one —
                 * the crawl touches 250 players a page, deep down the ladder,
                 * almost none of whom are viewed before the five-minute window
                 * lapses. The request path warms its own entries on a miss, and
                 * the crawler still warms every ladder page it reads.
                 */

                const ranked =
                    target.bracket === "1v1"
                        ? snapshotFromRow(row as Ranking1v1)
                        : snapshotFromRanked(
                              yield* upstream.getPlayerRanked(playerId),
                          )
                /*
                 * Written either way, and that is a change: a player with no
                 * 1v1 record used to be skipped whole, which meant a 3v3-only
                 * player appeared in no table at all despite having been
                 * fetched. Their career stats, legends and weapons are real
                 * whether or not a 1v1 record exists, so only the ranked
                 * columns wait for a pass that can fill them.
                 */
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

        /**
         * Samples one ladder's top for activity.
         *
         * One request per page, then one write. No player is fetched, which is
         * what separates this from `crawlTarget`: the ten-page sample of a
         * single ladder costs ten requests here, and the one page `crawlTarget`
         * walks costs 51 — one rankings read plus one stats read per player.
         */
        const sampleQueue: Context.Service.Shape<
            typeof Crawler
        >["sampleQueue"] = (target, config) =>
            Effect.gen(function* () {
                /*
                 * Every page is read before anything is written, and that is
                 * load-bearing rather than tidy.
                 *
                 * A player can hold several teams near the top of the 2v2
                 * ladder, so their key can appear on more than one page with a
                 * different game count. Writing page by page lets the later
                 * page's larger figure look like a game played *since the
                 * previous page* — thirty seconds earlier — and stamps
                 * `queuedAt` on someone who never queued. Sampling the whole
                 * ladder first means the dedupe spans it, so the only thing that
                 * can raise a stored count is the next pass.
                 */
                const sampled: (Ranking1v1 | Ranking2v2 | Ranking3v3)[] = []

                for (let page = 1; page <= config.queuePagesPerTarget; page++) {
                    const rows = yield* upstream.getRankings(
                        target.bracket,
                        target.region,
                        page,
                    )

                    // Off the end of the ladder: nothing further to sample, and
                    // the pass is not a failure.
                    if (rows.length === 0) break

                    sampled.push(
                        ...(rows as readonly (
                            | Ranking1v1
                            | Ranking2v2
                            | Ranking3v3
                        )[]),
                    )

                    // Paced here rather than per player, because there is no
                    // per-player work to pace.
                    yield* Effect.sleep(config.requestSpacingMs)
                }

                if (sampled.length === 0) return 0

                yield* database.upsertRankedQueue(
                    toRankedQueueRows(
                        target.bracket,
                        target.region,
                        sampled,
                        new Date(),
                    ),
                )

                /*
                 * Prune after writing, never before: the rows just sampled are
                 * the ones that must survive, and every one of them has this
                 * pass's timestamp.
                 */
                yield* database
                    .pruneRankedQueue(
                        target.bracket,
                        target.region,
                        new Date(Date.now() - RANKED_QUEUE_RETENTION_MS),
                    )
                    .pipe(
                        // Housekeeping. A failure leaves rows that are invisible
                        // to the queue anyway, so it must not fail the sample.
                        Effect.catch((error) =>
                            Effect.logWarning(
                                `queue prune failed for ${target.label}: ` +
                                    describeError(error),
                            ),
                        ),
                    )

                yield* Effect.logInfo(
                    `sampled ${sampled.length} rows of ${target.label}`,
                )

                return sampled.length
            }).pipe(
                // A failed ladder must not end the pass; the other 26 still run.
                Effect.catch((error) =>
                    Effect.logWarning(
                        `queue sample failed for ${target.label}: ` +
                            describeError(error),
                    ).pipe(Effect.as(0)),
                ),
            )

        /**
         * Records a target's cursor.
         *
         * A storage failure is a warning rather than a failed pass: the cursor
         * only decides where the *next* pass starts, and every page is written
         * on its own, so losing it costs a re-read and nothing else.
         */
        const recordProgress = (target: CrawlTarget, page: number) =>
            database
                .setCrawlProgress(target.id, target.label, page)
                .pipe(
                    Effect.catch(() =>
                        Effect.logWarning(
                            `could not record progress for ${target.label}`,
                        ),
                    ),
                )

        const crawlTarget: Context.Service.Shape<
            typeof Crawler
        >["crawlTarget"] = (target, config) =>
            Effect.gen(function* () {
                const resume = yield* database
                    .getCrawlProgress(target.id)
                    .pipe(Effect.catch(() => Effect.succeed(null)))

                /*
                 * A cursor outside `[1, maxPage]` starts over at the top.
                 *
                 * Out of range is not hypothetical: the cap is newer than the
                 * cursor rows are, so a target can be holding a page above it
                 * from before the cap existed, and a walk that resumed from
                 * there would spend its passes on exactly the pages the cap
                 * exists to exclude.
                 */
                const start =
                    resume === null || resume < 1 || resume > config.maxPage
                        ? 1
                        : resume

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
                        yield* recordProgress(target, 1)

                        yield* Effect.logInfo(
                            `${target.label} exhausted at page ${page}; ` +
                                `wrapping to 1`,
                        )

                        return
                    }

                    /*
                     * The cap is the last page the walk visits, so the fetch
                     * after it is the top of the ladder again — not page 51.
                     * Returning rather than falling through matters when
                     * `pagesPerTarget` is more than one: the loop's own counter
                     * knows nothing about the cap and would walk straight past
                     * it.
                     */
                    const reachedCap = page >= config.maxPage

                    yield* recordProgress(target, reachedCap ? 1 : page + 1)

                    if (reachedCap) {
                        yield* Effect.logInfo(
                            `${target.label} reached the ` +
                                `${config.maxPage}-page cap; wrapping to 1`,
                        )

                        return
                    }
                }
            })

        return {
            crawlPage,
            crawlTarget,
            sampleQueue,

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
