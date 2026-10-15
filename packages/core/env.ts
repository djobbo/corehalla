import type { D1Database } from "@crh/db/client"

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
    DB?: D1Database
    CACHE?: KVNamespaceLike
    RATE_LIMITER?: RateLimitLike
    CRAWL_QUEUE?: QueueProducerLike
    /** Separate from `CRAWL_QUEUE` so samples are not starved by ladder walks. */
    CRAWL_SAMPLE_QUEUE?: QueueProducerLike
    SITE_URL?: string
    [key: string]: unknown
}

let cached: WorkerEnvironment | null = null

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

export const envValue = async (key: string): Promise<string | undefined> => {
    const fromProcess = processValue(key)

    if (fromProcess) return fromProcess

    const env = await workerEnv()
    const value = env[key]

    return typeof value === "string" && value.length > 0 ? value : undefined
}

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

/** Per call — bindings exist only once a request is in flight. Missing = no L2. */
export const cacheNamespace = async (): Promise<
    KVNamespaceLike | undefined
> => {
    const env = await workerEnv()

    return env.CACHE
}

export type RateLimitLike = {
    limit: (options: { key: string }) => Promise<{ success: boolean }>
}

export const rateLimitBinding = async (): Promise<
    RateLimitLike | undefined
> => {
    const env = await workerEnv()

    return env.RATE_LIMITER
}

export type QueueProducerLike = {
    send: (body: unknown) => Promise<void>
}

export const crawlQueue = async (): Promise<QueueProducerLike | undefined> => {
    const env = await workerEnv()

    return env.CRAWL_QUEUE
}

/** Kept apart from {@link crawlQueue} so samples are never queued behind ladder walks. */
export const crawlSampleQueue = async (): Promise<
    QueueProducerLike | undefined
> => {
    const env = await workerEnv()

    return env.CRAWL_SAMPLE_QUEUE
}
