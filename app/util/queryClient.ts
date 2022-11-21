import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: true,
            retry: 4,
            retryDelay: (attemptIndex) =>
                Math.min(500 + 250 * 2 ** attemptIndex, 30000),
        },
    },
})
