import { QueryClient } from "@tanstack/react-query"
import { createTRPCProxyClient, httpLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "server/router"

const getBaseUrl = () => {
    if (typeof window !== "undefined") return ""

    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

    return `http://localhost:${process.env.PORT ?? 3000}`
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: 3,
            retryDelay: (attemptIndex) =>
                Math.min(1000 * 2 ** attemptIndex, 30000),
        },
    },
})

export const trpc = createTRPCReact<AppRouter>()

const trpcLinks = [
    httpLink({
        url: `${getBaseUrl()}/api/trpc`,
    }),
]

export const trpcClient = trpc.createClient({
    links: trpcLinks,
})

export const trpcProxy = createTRPCProxyClient<AppRouter>({
    links: trpcLinks,
})
