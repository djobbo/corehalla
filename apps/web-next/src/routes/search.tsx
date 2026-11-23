import { createFileRoute, redirect } from "@tanstack/react-router"
import { ladderRedirectTarget } from "@/lib/legacyLadder"

type SearchQuery = { q?: string | undefined }

export const Route = createFileRoute("/search")({
    validateSearch: (search: Record<string, unknown>): SearchQuery => ({
        q: typeof search.q === "string" ? search.q : undefined,
    }),
    beforeLoad({ search }) {
        throw redirect({
            href: ladderRedirectTarget({ q: search.q }),
            statusCode: 308,
        })
    },
})
