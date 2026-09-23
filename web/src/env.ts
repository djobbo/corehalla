import type { D1Database } from "db/client"

/**
 * Runtime environment.
 *
 * Node (Vite dev, build) reads `process.env`. On Cloudflare the values arrive as
 * Worker bindings, reached through `cloudflare:workers`. The import is dynamic
 * and guarded so a Node process — where that module does not exist — keeps
 * working unchanged.
 */

type WorkerEnvironment = {
    /** The D1 database binding (see `alchemy.run.ts` at the repo root). */
    DB?: D1Database
    BRAWLHALLA_API_KEY?: string
    SITE_URL?: string
    INTERNAL_ORIGIN?: string
    DISCORD_CLIENT_ID?: string
    DISCORD_CLIENT_SECRET?: string
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
 * Only the Worker has it; run the app through `alchemy dev` (or deploy it) when
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
