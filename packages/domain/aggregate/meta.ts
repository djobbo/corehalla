import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { legendsMap } from "@crh/bhapi/legends"
import type { LegendMeta, LegendMetaFloor } from "@crh/api-contract/schemas"

export type LegendMetaRowInput = {
    readonly legendId: number
    readonly games: number
    readonly wins: number
    readonly accounts: number
}

export type LegendMetaSample = {
    readonly accounts: number
    readonly floor: LegendMetaFloor
}

/** Four decimals of a fraction; a zero denominator reads as zero, never NaN. */
const fraction = (part: number, whole: number): number =>
    whole <= 0 ? 0 : Math.round((part / whole) * 10_000) / 10_000

export const buildLegendMeta = (
    rows: readonly LegendMetaRowInput[],
    sample: LegendMetaSample,
): LegendMeta => {
    const totalGames = rows.reduce((sum, row) => sum + row.games, 0)

    return {
        data: rows.flatMap((row) => {
            const legend = legendsMap[row.legendId]

            if (legend === undefined || row.games <= 0) return []

            return [
                {
                    legendId: row.legendId,
                    slug: getEntitySlug(legend.legend_id, legend.bio_name),
                    games: row.games,
                    wins: row.wins,
                    winRate: fraction(row.wins, row.games),
                    playShare: fraction(row.games, totalGames),
                    accounts: row.accounts,
                },
            ]
        }),
        meta: {
            accounts: sample.accounts,
            ratingFloor: sample.floor === "all" ? null : Number(sample.floor),
        },
    }
}
