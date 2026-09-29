import type { D1Database } from "@crh/db/client"

/**
 * Runtime bindings for the API worker.
 *
 * The worker reads its values the same way the Start app did: `process.env`
 * under Node (Vite dev, build) and the `cloudflare:workers` binding table on
 * Cloudflare. The dynamic import is guarded so a Node process keeps working.
 */

/**
 * The subset of the Workers KV API this worker uses.
 *
 * Declared structurally rather than by pulling in `@cloudflare/workers-types`,
 * the same way `DB` is: the binding only has to satisfy what the cache calls.
 */
export type KVNamespaceLike = {
    get: (key: string) => Promise<string | null>
    put: (
        key: string,
        value: string,
        options?: { expirationTtl?: number },
    ) => Promise<void>
    delete: (key: string) => Promise<void>
}

type WorkerEnvironment = {
    /** The shared D1 database binding (see `alchemy.run.ts`). */
    DB?: D1Database
    /** The KV namespace backing the read-through cache. */
    CACHE?: KVNamespaceLike
    /** Cloudflare's rate-limiting binding, used as the refresh damper. */
    RATE_LIMITER?: RateLimitLike
    /** The queue the cron producer enqueues ladder crawls onto. */
    CRAWL_QUEUE?: QueueProducerLike
    /**
     * The queue the cron producer enqueues activity samples onto.
     *
     * A second queue rather than a second kind on the first: the sampler is the
     * freshness surface and the ladder walk is the expensive one, so a shared
     * lane made every ten-minute sample wait behind the half-hourly crawl.
     */
    CRAWL_SAMPLE_QUEUE?: QueueProducerLike
    BRAWLHALLA_API_KEY?: string
    SITE_URL?: string
    [key: string]: unknown
}

let cached: WorkerEnvironment | null = null

/** The Worker bindings, or an empty object on Node. */
export const workerEnv = async (): Promise<WorkerEnvironment> => {
    if (cached) return cached

    try {
        const cf = (await import(/* @vite-ignore */ "cloudflare:workers")) as {
            env?: WorkerEnvironment
        }

        cached = cf.env ?? {}
    } catch {
        cached = {}
    }

    return cached
}

const processValue = (key: string): string | undefined => {
    const value = globalThis.process?.env?.[key]

    return typeof value === "string" && value.length > 0 ? value : undefined
}

/** Reads a variable from `process.env` (Node) or the Worker bindings. */
export const envValue = async (key: string): Promise<string | undefined> => {
    const fromProcess = processValue(key)

    if (fromProcess) return fromProcess

    const env = await workerEnv()
    const value = env[key]

    return typeof value === "string" && value.length > 0 ? value : undefined
}

/**
 * The D1 database binding.
 *
 * Only the Worker has it; run the API through `alchemy dev` (or deploy it) when
 * a request needs the database.
 */
export const d1Database = async (): Promise<D1Database> => {
    const env = await workerEnv()
    const db = env.DB

    if (!db) {
        throw new Error(
            "No D1 `DB` binding. Run `pnpm dev:cloud` (alchemy dev) " +
                "or deploy through the Alchemy stack; plain `vite dev` has no bindings.",
        )
    }

    return db
}

/**
 * The KV namespace backing the read-through cache, or `undefined` when it is
 * not bound.
 *
 * Resolved per call rather than at module scope: bindings do not exist until a
 * request is in flight. The cache treats a missing namespace as "no L2" and
 * works from its in-isolate tier alone, so local runs without the binding still
 * behave.
 */
export const cacheNamespace = async (): Promise<
    KVNamespaceLike | undefined
> => {
    const env = await workerEnv()

    return env.CACHE
}

/**
 * The subset of Cloudflare's rate-limiting binding this worker uses.
 *
 * Declared structurally for the same reason as `KVNamespaceLike`: the binding
 * only has to satisfy what the limiter calls.
 */
export type RateLimitLike = {
    limit: (options: { key: string }) => Promise<{ success: boolean }>
}

/**
 * The rate-limiting binding, or `undefined` when it is not bound.
 *
 * A missing binding is not an error: the limiter fails open, so local runs and
 * any deploy without it simply have no damper.
 */
export const rateLimitBinding = async (): Promise<
    RateLimitLike | undefined
> => {
    const env = await workerEnv()

    return env.RATE_LIMITER
}

/**
 * The subset of the Workers queue producer API this worker uses.
 *
 * Structural for the same reason as the other bindings; the crawler only has to
 * be able to enqueue a job.
 */
export type QueueProducerLike = {
    send: (body: unknown) => Promise<void>
}

/**
 * The crawl queue, or `undefined` when it is not bound.
 *
 * A missing queue is not an error: the scheduled handler logs and does nothing,
 * so a deploy without the binding produces no crawl rather than a failing cron.
 */
export const crawlQueue = async (): Promise<QueueProducerLike | undefined> => {
    const env = await workerEnv()

    return env.CRAWL_QUEUE
}

/**
 * The activity-sampling queue, or `undefined` when it is not bound.
 *
 * Kept apart from {@link crawlQueue} so a sample — one request per page, ten
 * pages a ladder — is never queued behind a ladder walk — a stats read for each
 * of 50 players. The two were one lane, and the expensive half starved the
 * cheap one. Missing-binding handling is the same as above.
 */
export const crawlSampleQueue = async (): Promise<
    QueueProducerLike | undefined
> => {
    const env = await workerEnv()

    return env.CRAWL_SAMPLE_QUEUE
}
