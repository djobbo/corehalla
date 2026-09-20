import { createFileRoute } from "@tanstack/react-router"
import { apiHandler } from "@/effect/Server"

/**
 * Mounts the Effect `HttpApi` (see `src/effect/Api.ts`) as a TanStack Start
 * server route.
 *
 * This replaces the tRPC endpoint. `HttpApiBuilder` owns request decoding,
 * routing, and response encoding, so this file only forwards the raw `Request`.
 */
export const Route = createFileRoute("/api/effect/$")({
    server: {
        handlers: {
            GET: ({ request }) => apiHandler(request),
            POST: ({ request }) => apiHandler(request),
        },
    },
})
