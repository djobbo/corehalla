import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { layer as sqlLayer } from "@crh/db/client"
import { d1Database } from "@crh/core/env"
import { layer as DatabaseLayer } from "@crh/core/services/archive"
import { inlineLayer as inlineBackgroundLayer } from "@crh/core/services/background"
import { layer as CacheLayer } from "@crh/core/services/cache"
import { rawLayer as UpstreamLayer } from "@crh/core/services/upstream"
import { layer as CrawlerLayer } from "@crh/core/services/crawler"
import type { Crawler } from "@crh/core/services/crawler"

/**
 * Runs a crawler effect against services scoped to the invocation.
 *
 * Deliberately separate from `server.ts`: the request path keeps one service
 * graph alive for the isolate, while a queue delivery is a discrete unit of
 * work that builds its D1 client and releases it when it finishes. Sharing the
 * request graph would keep a crawler's clients resident for the life of the
 * isolate for no benefit.
 *
 * The crawler reads through `Upstream` (uncached) rather than the `Brawlhalla`
 * gateway, so the cache and its budget damper are absent from this graph by
 * design — the crawler is the refresh path those exist to protect.
 */
export const runCrawler = async <A, E>(
    effect: Effect.Effect<A, E, Crawler>,
): Promise<A> => {
    const db = await d1Database()

    const DatabaseWithSql = DatabaseLayer.pipe(Layer.provide(sqlLayer(db)))

    const UpstreamWithDeps = UpstreamLayer.pipe(
        Layer.provide(DatabaseWithSql),
        Layer.provide(FetchHttpClient.layer),
    )

    const ServicesLayer = Layer.mergeAll(DatabaseWithSql, UpstreamWithDeps)

    const CrawlerFull = CrawlerLayer.pipe(
        Layer.provide(ServicesLayer),
        /*
         * The crawler writes to the cache (warming it) without reading from it,
         * so it needs the layer even though it never calls `getOrSet`. The
         * cache schedules stale refreshes through `Background`, and this graph
         * has no request lifetime to extend, so the inline layer is the right
         * one: nothing here should detach from the invocation that started it.
         */
        Layer.provide(CacheLayer),
        Layer.provide(inlineBackgroundLayer),
    )

    return Effect.runPromise(
        Effect.scoped(
            Effect.gen(function* () {
                const context = yield* Layer.build(
                    CrawlerFull as Layer.Layer<Crawler, unknown, never>,
                )

                return yield* effect.pipe(Effect.provide(context))
            }),
        ),
    )
}
