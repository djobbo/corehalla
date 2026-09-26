import { Effect } from "effect"
import { crawlTargets } from "@crh/bhapi/crawlTargets"
import { crawlQueue } from "@crh/core/env"
import { Crawler, defaultCrawlerConfig } from "@crh/core/services/crawler"
import { runCrawler } from "./runtime"

/**
 * Cloudflare Worker entry for the ladder crawler.
 *
 * Separate from `@crh/api` so the two stop contending for the same upstream
 * allowance. The split is about *our* accounting, not Brawlhalla's: the v1 limit
 * is per IP and Workers egress from shared Cloudflare addresses, so two Workers
 * do not give two allowances. What it does give is two independent budgets we
 * control — each worker paces itself, the crawler cannot spend the share
 * reserved for user requests, and a crawler failure or slow pass cannot affect
 * request latency at all.
 *
 * There is no `fetch` handler here on purpose. This worker only produces and
 * consumes crawl work; it serves no traffic, so it also cannot be reached from
 * the internet.
 *
 * Bindings are read lazily inside each handler through `@crh/core/env`, because
 * they do not exist at module scope.
 */

/**
 * The queue payload: which ladder to crawl.
 *
 * An id rather than the whole target, so the message stays stable if the matrix
 * changes and an in-flight message cannot carry a stale bracket/region pair. A
 * message naming a target that no longer exists is acknowledged and dropped.
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
    scheduled,
    queue,
}
