import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { getTeamPlayers } from "@crh/bhapi/helpers/getTeamPlayers"
import { legendsMap } from "@crh/bhapi/legends"
import type { BestLegendRow } from "@crh/core/services/archive"
import type { Ranking1v1, Ranking2v2, Ranking3v3 } from "@crh/bhapi/types"
import type {
    Rankings1v1Envelope,
    Rankings2v2Envelope,
    Rankings3v3Envelope,
} from "@crh/api-contract/schemas"

/**
 * The live ladders, reshaped from upstream rows into the product view.
 *
 * v1's leaderboard is close to a domain model already, so the work here is not
 * arithmetic: it is the three things the raw row cannot express.
 *
 * 1. **A link.** Every row gets a `slug`, because a client should not be
 *    rebuilding a URL segment from an id and a name.
 * 2. **A pair.** 2v2 rows carry a `team` tuple rather than v1's `players[]`, so
 *    the shape matches every other player reference on the API.
 * 3. **A best legend.** v1 dropped `best_legend`, and the archive already
 *    stores the legend table for exactly the players who appear on a ladder
 *    top. {@link bestLegendIndex} folds that read into a lookup, and a row
 *    falls back to v1's own numbers when the archive has never crawled them.
 */

/** The best-legend lookup, keyed by player id. */
export const bestLegendIndex = (
    rows: readonly BestLegendRow[],
): ReadonlyMap<string, BestLegendRow> => {
    const index = new Map<string, BestLegendRow>()

    for (const row of rows) {
        const current = index.get(row.playerId)

        // Max games wins; ties keep the first, which is stable across calls
        // because the read itself is unordered but the row set is not.
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
    now: number,
): Rankings1v1Envelope => ({
    data: rows.map((row) => {
        const archived = bestLegends.get(String(row.brawlhalla_id))

        // The archive's answer is preferred because v1's `best_legend` has been
        // zero for every row since the field was dropped; a fallback to the
        // row's own numbers keeps this working if that ever changes.
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
    meta: { updated_at: now },
})

export const buildRankings2v2 = (
    rows: readonly Ranking2v2[],
    now: number,
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
    meta: { updated_at: now },
})

export const buildRankings3v3 = (
    rows: readonly Ranking3v3[],
    now: number,
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
    meta: { updated_at: now },
})
