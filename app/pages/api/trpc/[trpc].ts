import * as trpcNext from "@trpc/server/adapters/next"
import { appRouter } from "server/router"

export default trpcNext.createNextApiHandler({
    router: appRouter,
    createContext: () => ({}),
    batching: {
        enabled: false,
    },
    responseMeta({ paths, type, errors }) {
        // assuming you have all your public routes with the keyword `public` in them
        const allPublic =
            paths && paths.every((path) => path.includes("public"))
        // checking that no procedures errored
        const allOk = errors.length === 0
        // checking we're doing a query request
        const isQuery = type === "query"
        if (allPublic && allOk && isQuery) {
            // cache for 1 day + revalidate once every 15 minutes
            const CACHE_TIME = 60 * 60 * 24
            const REVALIDATE_TIME = 60 * 15

            return {
                headers: {
                    "cache-control": `s-maxage=${REVALIDATE_TIME}, stale-while-revalidate=${CACHE_TIME}`,
                },
            }
        }
        return {}
    },
})
