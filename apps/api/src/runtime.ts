import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { layer as sqlLayer } from "@crh/db/client"
import { d1Database } from "./env"
import { layer as DatabaseLayer } from "./services/archive"
import { rawLayer as UpstreamLayer } from "./services/upstream"
import { layer as CrawlerLayer } from "./services/crawler"
import type { Crawler } from "./services/crawler"

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

    const CrawlerFull = CrawlerLayer.pipe(Layer.provide(ServicesLayer))

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
