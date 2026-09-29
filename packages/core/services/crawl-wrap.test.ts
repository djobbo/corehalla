import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import type { Context } from "effect"
import { crawlTargets } from "@crh/bhapi/crawlTargets"
import { rankings1v1Mock } from "@crh/bhapi/mocks/rankings1v1"
import type { RankedRegion } from "@crh/bhapi/constants"
import type { Ladder } from "@crh/bhapi/types"
import { Database } from "./archive"
import { Cache } from "./cache"
import { Crawler, defaultCrawlerConfig, layer as crawlerLayer } from "./crawler"
import { Upstream } from "./upstream"
import type { CrawlerConfig } from "./crawler"

const oneVOne = crawlTargets.find((target) => target.bracket === "1v1")!

const harness = (options: {
    readonly resume: number | null
    readonly rows?: boolean
}) => {
    const readPages: number[] = []
    const writtenPages: number[] = []

    const upstream = Layer.succeed(Upstream, {
        getRankings: (_bracket: Ladder, _region: RankedRegion, page: number) =>
            Effect.sync(() => {
                readPages.push(page)

                return options.rows === false ? [] : rankings1v1Mock.slice(0, 1)
            }),

        getPlayerStats: () => Effect.succeed(null),
    } as unknown as Context.Service.Shape<typeof Upstream>)

    const database = Layer.succeed(Database, {
        getCrawlProgress: () => Effect.succeed(options.resume),
        setCrawlProgress: (_id: string, _label: string, page: number) =>
            Effect.sync(() => {
                writtenPages.push(page)
            }),
    } as unknown as Context.Service.Shape<typeof Database>)

    const cache = Layer.succeed(Cache, {
        set: () => Effect.void,
    } as unknown as Context.Service.Shape<typeof Cache>)

    const layer = crawlerLayer.pipe(
        Layer.provide(upstream),
        Layer.provide(database),
        Layer.provide(cache),
    )

    return { readPages, writtenPages, layer }
}

const walk = (
    layer: ReturnType<typeof harness>["layer"],
    config: CrawlerConfig = defaultCrawlerConfig,
) =>
    Crawler.pipe(
        Effect.flatMap((crawler) => crawler.crawlTarget(oneVOne, config)),
        Effect.provide(layer),
    )

// it.live: crawl uses real Effect.delay; TestClock would hang.
describe("the crawl cursor", () => {
    it.live("advances one page while it is below the cap", () =>
        Effect.gen(function* () {
            const { readPages, writtenPages, layer } = harness({ resume: 49 })

            yield* walk(layer)

            expect(readPages).toEqual([49])
            expect(writtenPages).toEqual([50])
        }),
    )

    it.live("wraps to the first page after fetching the cap", () =>
        Effect.gen(function* () {
            const { readPages, writtenPages, layer } = harness({ resume: 50 })

            yield* walk(layer)

            // Page 50 is fetched and then the cursor is page one — not 51.
            expect(readPages).toEqual([50])
            expect(writtenPages).toEqual([1])
        }),
    )

    it.live("starts over when the stored cursor is past the cap", () =>
        Effect.gen(function* () {
            const { readPages, writtenPages, layer } = harness({ resume: 73 })

            yield* walk(layer)

            // A row written before the cap existed must not resume above it.
            expect(readPages).toEqual([1])
            expect(writtenPages).toEqual([2])
        }),
    )

    it.live("never walks past the cap when a pass covers several pages", () =>
        Effect.gen(function* () {
            const { readPages, writtenPages, layer } = harness({ resume: 49 })

            yield* walk(layer, { ...defaultCrawlerConfig, pagesPerTarget: 3 })

            expect(readPages).toEqual([49, 50])
            expect(writtenPages).toEqual([50, 1])
        }),
    )

    it.live("still wraps on an empty page before the cap", () =>
        Effect.gen(function* () {
            const { readPages, writtenPages, layer } = harness({
                resume: 12,
                rows: false,
            })

            yield* walk(layer)

            expect(readPages).toEqual([12])
            expect(writtenPages).toEqual([1])
        }),
    )
})
