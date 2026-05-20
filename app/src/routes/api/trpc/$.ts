import { createFileRoute } from "@tanstack/react-router"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "server/router"

const CACHE_TIME = 60 * 60 * 24
const REVALIDATE_TIME = 30

export const Route = createFileRoute("/api/trpc/$")({
    server: {
        handlers: {
            GET: ({ request }) => handleTrpc(request),
            POST: ({ request }) => handleTrpc(request),
        },
    },
})

function handleTrpc(request: Request) {
    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext: () => ({}),
        batching: {
            enabled: false,
        },
        responseMeta({ paths, type, errors }) {
            const allPublic =
                paths && paths.every((path) => path.includes("public"))
            const allOk = errors.length === 0
            const isQuery = type === "query"
            if (allPublic && allOk && isQuery) {
                return {
                    headers: {
                        "cache-control": `s-maxage=${REVALIDATE_TIME}, stale-while-revalidate=${CACHE_TIME}`,
                    },
                }
            }
            return {}
        },
    })
}
