import { createFileRoute, redirect } from "@tanstack/react-router"

type LegacyClanSearch = { q?: string | undefined }

export const Route = createFileRoute("/rankings/clans/{-$page}")({
    validateSearch: (search: Record<string, unknown>): LegacyClanSearch => ({
        q: typeof search.q === "string" ? search.q : undefined,
    }),
    beforeLoad({ params, search }) {
        const page = Number.parseInt(params.page ?? "1", 10)
        const suffix = search.q ? `?q=${encodeURIComponent(search.q)}` : ""

        throw redirect({
            href:
                Number.isFinite(page) && page > 1
                    ? `/rankings/guilds/${page}${suffix}`
                    : `/rankings/guilds${suffix}`,
            statusCode: 308,
        })
    },
})
