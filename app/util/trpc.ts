import { createTRPCNext } from "@trpc/next"
import { httpBatchLink } from "@trpc/client"
// TS2742: https://github.com/microsoft/TypeScript/issues/47663
import type {} from "@trpc/react-query"
import type {} from "@trpc/server"
import type { WorkerAPI } from "worker"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.corehalla.com"

export const trpc = createTRPCNext<WorkerAPI>({
    config({ ctx }) {
        if (typeof window !== "undefined") {
            // during client requests
            return {
                links: [
                    httpBatchLink({
                        url: API_URL,
                    }),
                ],
            }
        }

        return {
            links: [
                httpBatchLink({
                    url: API_URL,
                    /**
                     * Set custom request headers on every request from tRPC
                     * @link https://trpc.io/docs/v10/header
                     */
                    headers() {
                        if (ctx?.req) {
                            // TODO: Node 18 - omit the "connection" header
                            const {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                // connection: _connection,
                                ...headers
                            } = ctx.req.headers
                            return {
                                ...headers,
                                // Optional: inform server that it's an SSR request
                                "x-ssr": "1",
                            }
                        }
                        return {}
                    },
                }),
            ],
        }
    },
    ssr: true,
    responseMeta({ clientErrors }) {
        if (clientErrors.length) {
            // propagate first http error from API calls
            return {
                status: clientErrors[0].data?.httpStatus ?? 500,
            }
        }
        // cache full page for 1 day + revalidate once every second
        const ONE_DAY_IN_SECONDS = 60 * 60 * 24
        return {
            "Cache-Control": `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
        }
    },
})
