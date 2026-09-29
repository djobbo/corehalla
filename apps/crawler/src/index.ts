import { Effect } from "effect"
import { crawlTargets, queueTargets } from "@crh/bhapi/crawlTargets"
import { crawlSampleQueue, crawlQueue } from "@crh/core/env"
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
type CrawlJob = {
    readonly targetId: string
    /**
     * Which walk to run.
     *
     * Optional, and absent means `"ladder"`: it was the only kind when these
     * messages were first produced, so a message still in flight from a
     * previous deploy has to keep meaning what it meant.
     */
    readonly kind?: "ladder" | "queue"
}

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
 *
 * The two halves go onto **two queues**, and that split is the fix for a backlog
 * that grew without bound. They used to share one lane served by a single
 * serialised consumer, so the half-hourly walk — thirty jobs at a stats read per
 * player — sat in front of every ten-minute sample, and the two together asked
 * for more work per hour than one invocation could do. Separated, each lane is
 * comfortably under capacity on its own: the sampler is one request per page and
 * the walk is one per player, and neither can starve the other.
 */
/**
 * The cron expression that also runs the expensive half.
 *
 * Two schedules share this handler. The ten-minute one samples activity, which
 * is ten requests per ladder; the thirty-minute one additionally walks the
 * ladders in full, which is 51 requests for a 1v1 page and 101 for a team page.
 * Running the sampler at the full crawl's cadence would make the queue up to
 * half an hour stale, and running the full crawl every ten minutes would spend
 * the allowance three times over.
 */
const FULL_CRAWL_CRON = "*/30 * * * *"

const scheduled = async (event: { readonly cron?: string }): Promise<void> => {
    const samples = await crawlSampleQueue()
    const queue = await crawlQueue()

    if (!samples || !queue) {
        await Effect.runPromise(
            Effect.logWarning(
                "Missing CRAWL_QUEUE/CRAWL_SAMPLE_QUEUE binding; " +
                    "scheduled crawl did nothing",
            ),
        )

        return
    }

    // Every tick samples activity on all 27 per-region ladders.
    for (const target of queueTargets) {
        await samples.send({
            kind: "queue",
            targetId: target.id,
        } satisfies CrawlJob)
    }

    const fullPass = event.cron === FULL_CRAWL_CRON

    if (fullPass) {
        for (const target of crawlTargets) {
            await queue.send({
                kind: "ladder",
                targetId: target.id,
            } satisfies CrawlJob)
        }
    }

    await Effect.runPromise(
        Effect.logInfo(
            `enqueued ${queueTargets.length} queue samples` +
                (fullPass ? ` and ${crawlTargets.length} ladder crawls` : ""),
        ),
    )
}

/**
 * Queue: process one message per ladder, acknowledging only what completed.
 *
 * Serves both queues, because the batch does not have to say which one it came
 * from — the payload's `kind` already does, and it has since the sampler was
 * added. A message produced before the split still carries it, so the backlog
 * the old single queue was holding drains through this same path.
 */
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
            const kind = message.body.kind ?? "ladder"

            await runCrawler(
                Effect.gen(function* () {
                    const crawler = yield* Crawler

                    yield* kind === "queue"
                        ? crawler.sampleQueue(target, defaultCrawlerConfig)
                        : crawler.crawlTarget(target, defaultCrawlerConfig)
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
