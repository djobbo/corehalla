import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

/**
 * Convenience entry point for a search.
 *
 * Search and rankings are the same surface, so this only exists so an external
 * `/search?q=…` link resolves: it forwards to the rankings table that shows the
 * results.
 */
export const Route = createFileRoute("/search")({
    validateSearch: z.object({
        q: z.string().catch(""),
    }),
    beforeLoad: ({ search }) => {
        throw redirect({
            href: search.q
                ? `/rankings/1v1?q=${encodeURIComponent(search.q)}`
                : "/rankings/1v1",
            statusCode: 308,
        })
    },
})
