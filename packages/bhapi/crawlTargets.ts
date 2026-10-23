import { rankedRegions } from "./constants"
import type { RankedRegion } from "./constants"
import type { Ladder, Ranking1v1, Ranking2v2, Ranking3v3 } from "./types"

/**
 * Declared matrix so a product target cannot be silently missing from the crawl.
 * `"all"` is the merged ladder (not redundant with per-region). Power rankings
 * and clans are not here — they are not upstream-paged.
 */
export type CrawlTarget = {
    /** Composite id — one progress cursor per ladder, not one for the whole crawl. */
    readonly id: string
    readonly bracket: Ladder
    readonly region: RankedRegion
    readonly label: string
}

export const crawlTargetId = (bracket: Ladder, region: RankedRegion): string =>
    `${bracket}:${region}`

export const crawlTargets: readonly CrawlTarget[] = (
    ["1v1", "2v2", "3v3"] as const
).flatMap((bracket) =>
    rankedRegions.map((region) => ({
        id: crawlTargetId(bracket, region),
        bracket,
        region,
        label: `${bracket} ${region}`,
    })),
)

/**
 * 1v1 and 3v3 are both one player per row. Drops the `0` sentinel and
 * duplicate ids.
 */
export const playerIdsForRow = (
    bracket: Ladder,
    row: Ranking1v1 | Ranking2v2 | Ranking3v3,
): readonly number[] => {
    const ids =
        bracket === "2v2"
            ? [
                  (row as Ranking2v2).brawlhalla_id_one,
                  (row as Ranking2v2).brawlhalla_id_two,
              ]
            : [(row as Ranking1v1 | Ranking3v3).brawlhalla_id]

    return [...new Set(ids)].filter((id) => Number.isFinite(id) && id > 0)
}

/**
 * Every region except `all` — sampling the merge would double-file players
 * under a region they do not belong to.
 */
export const queueTargets: readonly CrawlTarget[] = crawlTargets.filter(
    (target) => target.region !== "all",
)
