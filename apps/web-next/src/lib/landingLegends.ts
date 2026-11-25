import { legendsMap } from "@crh/bhapi/legends"
import type { Legend } from "@crh/bhapi/types"
import type { LegendMeta, LegendMetaRow } from "@crh/api-contract/schemas"

/** The landing previews this many legends before deferring to the catalogue. */
export const LANDING_LEGENDS_LIMIT = 8

export type LandingLegend = {
    readonly legend: Legend
    readonly row: LegendMetaRow
}

const byPlayShare = (left: LandingLegend, right: LandingLegend): number =>
    right.row.playShare - left.row.playShare ||
    left.legend.legend_id - right.legend.legend_id

export const landingLegends = (
    board: LegendMeta | null,
): readonly LandingLegend[] => {
    if (board === null) return []

    return board.data
        .flatMap((row): LandingLegend[] => {
            const legend = legendsMap[row.legendId]

            return legend === undefined ? [] : [{ legend, row }]
        })
        .sort(byPlayShare)
        .slice(0, LANDING_LEGENDS_LIMIT)
}
