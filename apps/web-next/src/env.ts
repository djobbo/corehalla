type ServiceBinding = { fetch: (request: Request) => Promise<Response> }

type WorkerEnvironment = {
    // Only reach the API via this binding — a baked origin goes stale under alchemy dev.
    API?: ServiceBinding
    /** EmDash CMS, the origin behind `/static/*`. */
    CMS?: ServiceBinding
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

export const envValue = async (key: string): Promise<string | undefined> => {
    const value = (await workerEnv())[key]

    return typeof value === "string" && value.length > 0 ? value : undefined
}

export const apiBinding = async () => {
    const env = await workerEnv()

    return env.API
}

export const cmsBinding = async () => {
    const env = await workerEnv()

    return env.CMS
}
