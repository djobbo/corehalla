/**
 * Runtime environment for the server side of `web-next`.
 *
 * Values arrive as Worker bindings, reached through `cloudflare:workers`. The
 * import is dynamic and guarded so a Node process — where that module does not
 * exist — keeps working unchanged.
 */

type WorkerEnvironment = {
    /**
     * Service binding to the API worker (`@crh/api`).
     *
     * This is the *only* way this app reaches the API, from both the browser and
     * the server render. There is deliberately no origin anywhere: a URL would
     * have to be written down, and under `alchemy dev` the API's port is assigned
     * per run, so any value baked at build time goes stale the next time the
     * stack starts.
     */
    API?: { fetch: (request: Request) => Promise<Response> }
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

/** The API worker's service binding, or `undefined` when unconfigured. */
export const apiBinding = async () => {
    const env = await workerEnv()

    return env.API
}
