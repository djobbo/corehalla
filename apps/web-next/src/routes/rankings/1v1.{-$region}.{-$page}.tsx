import { createFileRoute, redirect } from "@tanstack/react-router"
import { ladderRedirectTarget } from "@/lib/legacyLadder"

type LegacyLadderSearch = { q?: string | undefined }

export const Route = createFileRoute("/rankings/1v1/{-$region}/{-$page}")({
    validateSearch: (search: Record<string, unknown>): LegacyLadderSearch => ({
        q: typeof search.q === "string" ? search.q : undefined,
    }),
    beforeLoad({ params, search }) {
        throw redirect({
            href: ladderRedirectTarget({
                region: params.region,
                page: params.page,
                q: search.q,
            }),
            statusCode: 308,
        })
    },
})
