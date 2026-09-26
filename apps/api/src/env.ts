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
export const cacheNamespace = async (): Promise<KVNamespaceLike | undefined> => {
    const env = await workerEnv()

    return env.CACHE
}
