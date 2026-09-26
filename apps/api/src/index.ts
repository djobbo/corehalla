import { Effect } from "effect"
import { crawlTargets } from "@crh/bhapi/crawlTargets"
import { apiHandler } from "./server"
import { crawlQueue } from "./env"
import { runCrawler } from "./runtime"
import { Crawler, defaultCrawlerConfig } from "./services/crawler"

/**
 * Cloudflare Worker entry for the Corehalla API.
 *
 * The `fetch` handler is the Effect `HttpApi` the Start app used to mount
 * in-process; only the transport changed. `HttpRouter.toWebHandler` returns a
 * WHATWG `fetch` handler, which is exactly what a Workers module needs, so no
 * platform-specific server layer is required.
 *
 * `scheduled` and `queue` are the crawler. They are plain handler properties
 * rather than a Durable Object, which is what keeps this entry a Workers module
 * instead of Alchemy's Effect-native `Worker.make()` form.
 *
 * Bindings are read lazily inside each handler through `./env`, because they do
 * not exist at module scope.
 */

/**
 * The queue payload: which ladder to crawl.
 *
 * An id rather than the whole target, so the message stays stable if the matrix
 * changes and an in-flight message cannot carry a stale bracket/region pair.
 * A message naming a target that no longer exists is acknowledged and dropped.
 */
type CrawlJob = { readonly targetId: string }

/** The subset of the Workers queue API this entry uses. */
type QueueMessage<T> = {
    readonly body: T
    ack: () => void
    retry: () => void
}
type MessageBatch<T> = { readonly messages: readonly QueueMessage<T>[] }

/**
 * Cron: enqueue one job per ladder.
 *
 * The scheduled handler only produces. Doing the crawl here instead would run
 * every ladder in a single invocation, which risks the CPU limit and gives no
 * retry granularity — one failing player would fail the whole pass. One message
 * per ladder means each is retried, paced, and limited on its own.
 */
const scheduled = async (): Promise<void> => {
    const queue = await crawlQueue()

    if (!queue) {
        await Effect.runPromise(
            Effect.logWarning(
                "No CRAWL_QUEUE binding; scheduled crawl did nothing",
            ),
        )

        return
    }

    for (const target of crawlTargets) {
        await queue.send({ targetId: target.id } satisfies CrawlJob)
    }

    await Effect.runPromise(
        Effect.logInfo(`enqueued ${crawlTargets.length} crawl jobs`),
    )
}

/** Queue: crawl one ladder, acknowledging only what completed. */
const queue = async (batch: MessageBatch<CrawlJob>): Promise<void> => {
    for (const message of batch.messages) {
        const target = crawlTargets.find(
            (candidate) => candidate.id === message.body.targetId,
        )

        if (!target) {
            await Effect.runPromise(
                Effect.logWarning(
                    `unknown crawl target "${message.body.targetId}"; dropping`,
                ),
            )

            message.ack()
            continue
        }

        try {
            await runCrawler(
                Effect.gen(function* () {
                    const crawler = yield* Crawler

                    yield* crawler.crawlTarget(target, defaultCrawlerConfig)
                }),
            )

            message.ack()
        } catch (error) {
            // Retrying is safe: every write is an upsert and progress is only
            // advanced after a page succeeds, so a redelivery re-reads rather
            // than duplicating.
            await Effect.runPromise(
                Effect.logError(
                    `crawl failed for ${target.label}; retrying`,
                    error,
                ),
            )

            message.retry()
        }
    }
}

export default {
    fetch: (request: Request) => apiHandler(request),
    scheduled,
    queue,
}
