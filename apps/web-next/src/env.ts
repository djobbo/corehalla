type WorkerEnvironment = {
    // Only reach the API via this binding — a baked origin goes stale under alchemy dev.
    API?: { fetch: (request: Request) => Promise<Response> }
    [key: string]: unknown
}

let cached: WorkerEnvironment | null = null

/** Worker bindings, or `{}` on Node where `cloudflare:workers` is absent. */
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

export const apiBinding = async () => {
    const env = await workerEnv()

    return env.API
}
