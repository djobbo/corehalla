import { createTRPCNext } from "@trpc/next"
import { httpLink } from "@trpc/client"
import type { AppRouter } from "../server/router"
// TS2742: https://github.com/microsoft/TypeScript/issues/47663
import type {} from "@trpc/react-query"

const getBaseUrl = () => {
    if (typeof window !== "undefined")
        // browser should use relative path
        return ""

    if (process.env.VERCEL_URL)
        // reference for vercel.com
        return `https://${process.env.VERCEL_URL}`

    // fallback to localhost
    return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCNext<AppRouter>({
    config() {
        return {
            links: [
                httpLink({
                    /**
                     * If you want to use SSR, you need to use the server's full URL
                     * @link https://trpc.io/docs/ssr
                     **/
                    url: `${getBaseUrl()}/api/trpc`,
                }),
            ],
            /**
             * @link https://tanstack.com/query/v4/docs/reference/QueryClient
             **/
            queryClientConfig: {
                defaultOptions: {
                    queries: {
                        staleTime: 60,
                        refetchOnWindowFocus: false,
                        refetchOnMount: false,
                        retry(failureCount) {
                            return failureCount < 3
                        },
                        retryDelay: (attemptIndex) =>
                            Math.min(1000 * 2 ** attemptIndex, 30000),
                    },
                },
            },
        }
    },
    /**
     * @link https://trpc.io/docs/ssr
     **/
    ssr: true,
    responseMeta({ clientErrors }) {
        if (clientErrors.length) {
            // propagate first http error from API calls
            return {
                status: clientErrors[0].data?.httpStatus ?? 500,
            }
        }

        // cache full page for 1 day + revalidate once every 10 minutes
        const CACHE_TIME = 60 * 60 * 24
        const REVALIDATE_TIME = 60 * 10
        return {
            "Cache-Control": `s-maxage=${REVALIDATE_TIME}, stale-while-revalidate=${CACHE_TIME}`,
        }
    },
})
