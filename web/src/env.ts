/**
 * Runtime environment.
 *
 * Node (local dev, the legacy SSR server) reads `process.env`. On Cloudflare the
 * same values arrive as Worker bindings, reached through `cloudflare:workers`.
 * The import is dynamic and guarded so a Node process — where that module does
 * not exist — keeps working unchanged.
 */

type WorkerEnvironment = {
    DATABASE_URL?: string
    BRAWLHALLA_API_KEY?: string
    SITE_URL?: string
    INTERNAL_ORIGIN?: string
    DISCORD_CLIENT_ID?: string
    DISCORD_CLIENT_SECRET?: string
    HYPERDRIVE?: { connectionString?: string }
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
 * The PostgreSQL connection URL.
 *
 * `DATABASE_URL` is what Node and the deploy-time tooling use; on Cloudflare the
 * Worker reads the Hyperdrive binding, whose connection string only exists
 * inside the request context.
 */
export const databaseUrl = async (): Promise<string> => {
    const direct = await envValue("DATABASE_URL")

    if (direct) return direct

    const env = await workerEnv()
    const connectionString = env.HYPERDRIVE?.connectionString

    return connectionString ?? ""
}
