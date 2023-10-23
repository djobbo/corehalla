import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

import { appRouter } from "@/server"

export const runtime = "edge"

const handler = (req: Request) => {
    return fetchRequestHandler({
        endpoint: "/api/trpc",
        router: appRouter,
        req,
        createContext: () => ({}),
    })
}

export { handler as GET, handler as POST }
