import type { trpcClient, trpcProxy } from "#/util/trpc"
import type { QueryClient } from "@tanstack/react-query"

export type RouterContext = {
    queryClient: QueryClient
    trpcClient: typeof trpcClient
    trpcProxy: typeof trpcProxy
}
