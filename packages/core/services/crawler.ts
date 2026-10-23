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

export type CrawlerConfig = {
    readonly pagesPerTarget: number
    /** Wrap to page 1 after this; product covers top 50 pages (top 2,500). */
    readonly maxPage: number
    readonly requestSpacingMs: number
    readonly playerConcurrency: number
    /** Sampler depth — ladder reads only, no per-player stats. */
    readonly queuePagesPerTarget: number
}

export const defaultCrawlerConfig: CrawlerConfig = {
    pagesPerTarget: 1,
    maxPage: 50,
    requestSpacingMs: 225,
    playerConcurrency: 1,
    queuePagesPerTarget: 10,
}

/** 1v1 ladder row only — team ratings must not write into player ranked columns. */
const snapshotFromRow = (row: Ranking1v1): RankedSnapshot => ({
    rating: row.rating,
    peak: row.peak_rating,
    games: row.games,
    wins: row.wins,
    tier: row.tier,
    region: row.region.toLowerCase() as RankedRegion,
})

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
        readonly crawlPage: (
            target: CrawlTarget,
            page: number,
            config: CrawlerConfig,
        ) => Effect.Effect<number>
        readonly crawlTarget: (
            target: CrawlTarget,
            config: CrawlerConfig,
        ) => Effect.Effect<void>
        readonly crawlAll: (config: CrawlerConfig) => Effect.Effect<void>
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

        const warmRanked = (playerId: number) =>
            Effect.gen(function* () {
                const ranked = yield* upstream.getPlayerRanked(playerId)

                if (ranked !== null) {
                    yield* cache.set(
                        cacheKeys.playerRanked(playerId),
                        ranked,
                        cacheTtl.profile,
                    )
                }

                return ranked
            })

        const crawlPlayer = (
            target: CrawlTarget,
            row: Ranking1v1 | Ranking2v2 | Ranking3v3,
            playerId: number,
            config: CrawlerConfig,
        ) =>
            Effect.gen(function* () {
                const stats = yield* upstream.getPlayerStats(playerId)

                if (!stats) return

                // Warm via set only — crawler must not read through Cache.
                yield* cache.set(
                    cacheKeys.playerStats(playerId),
                    stats,
                    cacheTtl.profile,
                )

                const ranked =
                    target.bracket === "1v1"
                        ? snapshotFromRow(row as Ranking1v1)
                        : snapshotFromRanked(yield* warmRanked(playerId))

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

        const sampleQueue: Context.Service.Shape<
            typeof Crawler
        >["sampleQueue"] = (target, config) =>
            Effect.gen(function* () {
                const sampled: (Ranking1v1 | Ranking2v2 | Ranking3v3)[] = []

                for (let page = 1; page <= config.queuePagesPerTarget; page++) {
                    const rows = yield* upstream.getRankings(
                        target.bracket,
                        target.region,
                        page,
                    )

                    if (rows.length === 0) break

                    sampled.push(
                        ...(rows as readonly (
                            | Ranking1v1
                            | Ranking2v2
                            | Ranking3v3
                        )[]),
                    )

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

                // Prune after writing — just-sampled rows must survive.
                yield* database
                    .pruneRankedQueue(
                        target.bracket,
                        target.region,
                        new Date(Date.now() - RANKED_QUEUE_RETENTION_MS),
                    )
                    .pipe(
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
                        yield* recordProgress(target, 1)

                        yield* Effect.logInfo(
                            `${target.label} exhausted at page ${page}; ` +
                                `wrapping to 1`,
                        )

                        return
                    }

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

                    for (const target of crawlTargets) {
                        yield* crawlTarget(target, config)
                    }
                }),
        }
    }),
)
