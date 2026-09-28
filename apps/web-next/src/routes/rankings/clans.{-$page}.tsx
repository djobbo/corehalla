import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * The old address of the guild leaderboard.
 *
 * Clans are guilds now, so the public URL is `/rankings/guilds`. The code and
 * the database still say clan; this redirect and the `clan` column names are the
 * only places the old name survives, purely for backwards compatibility with
 * indexed links. The `?q=` search rides along unchanged.
 */

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
