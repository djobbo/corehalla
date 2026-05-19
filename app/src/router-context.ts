import type { QueryClient } from "@tanstack/react-query"
import type { trpcClient, trpcProxy } from "@util/trpc"

export type RouterContext = {
    queryClient: QueryClient
    trpcClient: typeof trpcClient
    trpcProxy: typeof trpcProxy
}
