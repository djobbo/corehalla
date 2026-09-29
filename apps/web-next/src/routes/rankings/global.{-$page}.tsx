import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * The old address of the career boards.
 *
 * These pages used to live at `/rankings/global`, which named neither what they
 * rank (career totals, not a region) nor where the data comes from. They are the
 * players board of `Career` now, and this file exists only to keep the indexed
 * URLs alive: a 308 tells a crawler the new address is canonical and carries a
 * bookmarked link across without a rewrite rule. `?sortBy=` rides along, since
 * dropping it would bounce a shared "most KOs" link back to Account XP.
 */

type LegacyCareerSearch = { sortBy?: string | undefined }

export const Route = createFileRoute("/rankings/global/{-$page}")({
    validateSearch: (search: Record<string, unknown>): LegacyCareerSearch => ({
        sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
    }),
    beforeLoad({ params, search }) {
        const page = Number.parseInt(params.page ?? "1", 10)
        const suffix = search.sortBy
            ? `?sortBy=${encodeURIComponent(search.sortBy)}`
            : ""

        throw redirect({
            href:
                Number.isFinite(page) && page > 1
                    ? `/rankings/career/players/${page}${suffix}`
                    : `/rankings/career/players${suffix}`,
            statusCode: 308,
        })
    },
})
