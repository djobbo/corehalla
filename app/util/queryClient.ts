import { QueryClient } from "react-query"
import type { QueryClientConfig } from "react-query"

const queryClientConfig: QueryClientConfig = {
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: true,
            retry: 4,
            retryDelay: (attemptIndex) =>
                Math.min(500 + 250 * 2 ** attemptIndex, 30000),
        },
    },
}

export const queryClient = new QueryClient(queryClientConfig)
