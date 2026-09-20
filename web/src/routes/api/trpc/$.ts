import { createFileRoute } from "@tanstack/react-router"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "server/router"

/**
 * Server route replacing `pages/api/trpc/[trpc].ts`.
 *
 * The Start app itself calls server functions instead of tRPC, but this
 * endpoint is kept so any external consumer (and the existing
 * `packages/server` router) keeps working unchanged.
 */
const handler = (request: Request) =>
    fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext: () => ({}),
        responseMeta({ paths, type, errors }) {
            const allPublic =
                paths && paths.every((path) => path.includes("public"))
            const allOk = errors.length === 0
            const isQuery = type === "query"

            if (allPublic && allOk && isQuery) {
                const CACHE_TIME = 60 * 60 * 24
                const REVALIDATE_TIME = 30

                return {
                    headers: {
                        "cache-control": `s-maxage=${REVALIDATE_TIME}, stale-while-revalidate=${CACHE_TIME}`,
                    },
                }
            }

            return {}
        },
    })

export const Route = createFileRoute("/api/trpc/$")({
    server: {
        handlers: {
            GET: ({ request }) => handler(request),
            POST: ({ request }) => handler(request),
        },
    },
})
