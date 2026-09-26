import { rankedRegions } from "./constants"
import type { RankedRegion } from "./constants"
import type {
    Ladder,
    Ranking1v1,
    Ranking2v2,
    Ranking3v3,
} from "./types"

/**
 * Every upstream leaderboard the crawler has to walk.
 *
 * This exists because the crawler previously hard-coded a single call —
 * `getRankings("1v1", "all", page)` — which covered **one bracket and one
 * region value** out of the whole surface. Everything else (2v2, and all nine
 * real regions) was never crawled, so the local player table held only what the
 * global 1v1 ladder happened to contain.
 *
 * The matrix is declared rather than derived at each call site so that a target
 * added to the product cannot be silently missing from the crawl, and so the
 * per-target progress keys below are stable strings rather than positional.
 *
 * `"all"` is included deliberately. It is the merged cross-region ladder, so a
 * single page of it samples the top of every region at once; the per-region
 * ladders are what give each region its own coverage. They are not redundant —
 * a player ranked 400th in EU appears on no page of the global ladder.
 *
 * Power rankings are **not** here: they are computed locally from a scraped
 * page (`Content.getPowerRankings`), not served by the rankings endpoint, so
 * there is nothing upstream to page through. Clans are not here either — clan
 * rows are written from the D1 clan table, and `upsertClan` is called when a
 * clan page is viewed rather than by a crawl.
 */
export type CrawlTarget = {
    /**
     * Stable identity for the target, and the `CrawlProgress.id` it resumes
     * from.
     *
     * Composite because one progress pointer per *crawl* — which is what the
     * single `"Crawler"` row was — cannot express "1v1/eu is on page 37 while
     * 2v2/brz is on page 12". Per-target keys give each ladder its own cursor,
     * which is also what makes the walk resumable and the tables independently
     * current.
     */
    readonly id: string
    readonly bracket: Ladder
    readonly region: RankedRegion
    /** Human-readable, for logs and the `CrawlProgress.name` column. */
    readonly label: string
}

/** The bracket/region pair a target id encodes. */
export const crawlTargetId = (
    bracket: Ladder,
    region: RankedRegion,
): string => `${bracket}:${region}`

export const crawlTargets: readonly CrawlTarget[] = ([
    "1v1",
    "2v2",
    "3v3",
] as const)
    .flatMap((bracket) =>
        rankedRegions.map((region) => ({
            id: crawlTargetId(bracket, region),
            bracket,
            region,
            label: `${bracket} ${region}`,
        })),
    )

/**
 * The player ids on one leaderboard row.
 *
 * Only 2v2 is a team. **1v1 and 3v3 are both one player per row** — 3v3 is a
 * solo queue whose teams are assembled per match, so its ladder carries single
 * players and there is no trio to unpack. Assuming otherwise is what made the
 * 3v3 ladder render empty the first time it was wired up.
 *
 * The `0` sentinel Brawlhalla uses for "no player" is dropped, as is a duplicate
 * id — a malformed row with the same player twice would otherwise fetch and
 * upsert the same player twice in one pass.
 *
 * Returns ids as numbers so the caller can hand them straight to the stats
 * endpoint.
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
