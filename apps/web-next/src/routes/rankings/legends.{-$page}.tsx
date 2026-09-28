import { createFileRoute, redirect } from "@tanstack/react-router"
import { resolveLegendId, resolvePage } from "@/lib/routeParams"

/**
 * The old address of the per-legend board.
 *
 * Legends used to be a filter on a shared `/rankings/legends` page, selected by
 * `?legend=`. They live at `/rankings/career/legends/:legendId` now, so this
 * exists to keep the indexed URLs working: the legend is folded into the path
 * (and the old query value honoured) while a 308 marks the new address
 * canonical.
 */

type LegacyLegendSearch = {
    legend?: string | undefined
    sortBy?: string | undefined
}

export const Route = createFileRoute("/rankings/legends/{-$page}")({
    validateSearch: (search: Record<string, unknown>): LegacyLegendSearch => ({
        legend: typeof search.legend === "string" ? search.legend : undefined,
        sortBy: typeof search.sortBy === "string" ? search.sortBy : undefined,
    }),
    beforeLoad({ params, search }) {
        const legend = resolveLegendId(search.legend)
        const page = resolvePage(params.page)
        const suffix = search.sortBy
            ? `?sortBy=${encodeURIComponent(search.sortBy)}`
            : ""

        throw redirect({
            href:
                (page > 1
                    ? `/rankings/career/legends/${legend}/${page}`
                    : `/rankings/career/legends/${legend}`) + suffix,
            statusCode: 308,
        })
    },
})
