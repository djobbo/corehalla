import { createFileRoute, redirect } from "@tanstack/react-router"

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
