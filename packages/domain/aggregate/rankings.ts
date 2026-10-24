import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import { legendsMap } from "@crh/bhapi/legends"
import type { Ranking1v1, Ranking2v2, Ranking3v3 } from "@crh/bhapi/types"
export type BestLegendRow = {
    readonly playerId: string
    readonly legendId: number
    readonly games: number
    readonly wins: number
}

import type {
    Rankings1v1Envelope,
    Rankings2v2Envelope,
    Rankings3v3Envelope,
} from "@crh/api-contract/schemas"

export const bestLegendIndex = (
    rows: readonly BestLegendRow[],
): ReadonlyMap<string, BestLegendRow> => {
    const index = new Map<string, BestLegendRow>()

    for (const row of rows) {
        const current = index.get(row.playerId)

        // Max games wins; ties keep the first (read is unordered, row set is stable).
        if (current === undefined || row.games > current.games) {
            index.set(row.playerId, row)
        }
    }

    return index
}

const playerRef = (id: number, name: string) => ({
    id,
    name,
    slug: getEntitySlug(id, name),
})

export const buildRankings1v1 = (
    rows: readonly Ranking1v1[],
    bestLegends: ReadonlyMap<string, BestLegendRow>,
    updatedAt: number,
): Rankings1v1Envelope => ({
    data: rows.map((row) => {
        const archived = bestLegends.get(String(row.brawlhalla_id))

        // Prefer archive: v1's `best_legend` has been zero since the field was dropped.
        const legendId = archived?.legendId ?? row.best_legend
        const legend = legendId > 0 ? legendsMap[legendId] : undefined

        return {
            rank: row.rank,
            rating: row.rating,
            peak_rating: row.peak_rating,
            tier: row.tier,
            games: row.games,
            wins: row.wins,
            region: row.region,
            id: row.brawlhalla_id,
            name: row.name,
            slug: getEntitySlug(row.brawlhalla_id, row.name),
            best_legend: legend
                ? {
                      id: legend.legend_id,
                      name: legend.bio_name,
                      slug: getEntitySlug(legend.legend_id, legend.bio_name),
                      games: archived?.games ?? row.best_legend_games,
                      wins: archived?.wins ?? row.best_legend_wins,
                  }
                : null,
        }
    }),
    meta: { updated_at: updatedAt },
})

export const buildRankings2v2 = (
    rows: readonly Ranking2v2[],
    updatedAt: number,
): Rankings2v2Envelope => ({
    data: rows.map((row) => {
        const [one, two] = getTeamPlayers(row)

        return {
            rank: row.rank,
            rating: row.rating,
            peak_rating: row.peak_rating,
            tier: row.tier,
            games: row.games,
            wins: row.wins,
            region: row.region,
            team: [playerRef(one.id, one.name), playerRef(two.id, two.name)],
        }
    }),
    meta: { updated_at: updatedAt },
})

export const buildRankings3v3 = (
    rows: readonly Ranking3v3[],
    updatedAt: number,
): Rankings3v3Envelope => ({
    data: rows.map((row) => ({
        rank: row.rank,
        rating: row.rating,
        peak_rating: row.peak_rating,
        tier: row.tier,
        games: row.games,
        wins: row.wins,
        region: row.region,
        id: row.brawlhalla_id,
        name: row.name,
        slug: getEntitySlug(row.brawlhalla_id, row.name),
    })),
    meta: { updated_at: updatedAt },
})
