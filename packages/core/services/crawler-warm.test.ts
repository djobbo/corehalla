import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import type { Context } from "effect"
import { crawlTargets } from "@crh/bhapi/crawlTargets"
import { playerRankedMock } from "@crh/bhapi/mocks/playerRanked"
import { playerStatsMock } from "@crh/bhapi/mocks/playerStats"
import { rankings1v1Mock } from "@crh/bhapi/mocks/rankings1v1"
import { rankings2v2Mock } from "@crh/bhapi/mocks/rankings2v2"
import { Database } from "./archive"
import { Cache } from "./cache"
import { cacheKeys, cacheTtl } from "./cache-policy"
import { Crawler, defaultCrawlerConfig, layer as crawlerLayer } from "./crawler"
import { Upstream } from "./upstream"
import type { Database as DatabaseService } from "./archive"
import type { Cache as CacheService } from "./cache"
import type { Upstream as UpstreamService } from "./upstream"
import type { CrawlerConfig } from "./crawler"
import type { Ranking1v1, Ranking2v2 } from "@crh/bhapi/types"

/**
 * What the crawler puts in the cache.
 *
 * The crawler reads through the uncached `Upstream` because it is the refresh
 * path — but it *writes* the cache, and the entries it can warm are exactly the
 * ones it fetched. That is the whole reason `getPlayerStats` and
 * `getPlayerClan` are separate reads: the crawl fetches the career half and
 * never the card, so a merged key could not be warmed without either paying for
 * a request the crawl exists to avoid or storing something the profile gateway
 * would mistake for a complete profile.
 *
 * The window matters as much as the key. A warm written on a shorter freshness
 * than the reader expects is a hit that arrives already stale, which is the
 * silent half of the same failure.
 */

const config: CrawlerConfig = { ...defaultCrawlerConfig, requestSpacingMs: 0 }

const target = (bracket: "1v1" | "2v2") =>
    crawlTargets.find((entry) => entry.bracket === bracket)!

type Write = {
    readonly key: string
    readonly value: unknown
    readonly window: unknown
}

const harness = <Row extends Ranking1v1 | Ranking2v2>(rows: readonly Row[]) => {
    const writes: Write[] = []

    const upstream = Layer.succeed(Upstream, {
        getRankings: () => Effect.succeed(rows),
        getPlayerStats: () => Effect.succeed(playerStatsMock),
        getPlayerRanked: () => Effect.succeed(playerRankedMock),
    } as unknown as Context.Service.Shape<typeof UpstreamService>)

    const database = Layer.succeed(Database, {
        upsertPlayerStats: () => Effect.void,
    } as unknown as Context.Service.Shape<typeof DatabaseService>)

    const cache = Layer.succeed(Cache, {
        set: (key: string, value: unknown, window: unknown) =>
            Effect.sync(() => {
                writes.push({ key, value, window })
            }),
    } as unknown as Context.Service.Shape<typeof CacheService>)

    const layer = crawlerLayer.pipe(
        Layer.provide(upstream),
        Layer.provide(database),
        Layer.provide(cache),
    )

    return { writes, layer }
}

describe("crawler cache warming", () => {
    it.effect("warms the career stats for a 1v1 row's player", () =>
        Effect.gen(function* () {
            const { writes, layer } = harness(rankings1v1Mock.slice(0, 1))
            const playerId = rankings1v1Mock[0].brawlhalla_id

            yield* Crawler.pipe(
                Effect.flatMap((crawler) =>
                    crawler.crawlPage(target("1v1"), 1, config),
                ),
                Effect.provide(layer),
            )

            const keys = writes.map((write) => write.key)

            // The page itself is still warmed, as before.
            expect(keys).toContain(
                cacheKeys.leaderboard("1v1", target("1v1").region, 1),
            )

            const stats = writes.find(
                (write) => write.key === cacheKeys.playerStats(playerId),
            )

            expect(stats).toBeDefined()
            expect(stats?.window).toEqual(cacheTtl.profile)

            // A 1v1 row already carries the player's own rating, so the crawler
            // never fetches the ranked record — and must not claim to have
            // warmed one.
            expect(keys).not.toContain(cacheKeys.playerRanked(playerId))
        }),
    )

    it.effect("warms both entries for a 2v2 row's players", () =>
        Effect.gen(function* () {
            const { writes, layer } = harness(rankings2v2Mock.slice(0, 1))
            const row = rankings2v2Mock[0]

            yield* Crawler.pipe(
                Effect.flatMap((crawler) =>
                    crawler.crawlPage(target("2v2"), 1, config),
                ),
                Effect.provide(layer),
            )

            const keys = writes.map((write) => write.key)

            // A team row carries the team's rating, not the player's, so the
            // crawler fetches each member's own ranked record — and that read is
            // warmable.
            for (const playerId of [
                row.brawlhalla_id_one,
                row.brawlhalla_id_two,
            ]) {
                expect(keys).toContain(cacheKeys.playerStats(playerId))
                expect(keys).toContain(cacheKeys.playerRanked(playerId))
            }

            const ranked = writes.find(
                (write) =>
                    write.key === cacheKeys.playerRanked(row.brawlhalla_id_one),
            )
            expect(ranked?.value).toEqual(playerRankedMock)
            expect(ranked?.window).toEqual(cacheTtl.profile)
        }),
    )
})
