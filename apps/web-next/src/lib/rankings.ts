import type { RankedRegion } from "@crh/api-contract/schemas"

/** The schema is a value; its decoded type is `Type`. */
type Region = typeof RankedRegion.Type

/**
 * The ladder axes, and the URLs they live at.
 *
 * Grouped in one module because the chip row, the route loaders and the
 * breadcrumb-ish helpers all have to agree on the same URL shape — the whole
 * point of the filter being a router navigation is that what is on screen is
 * always described by the address bar.
 */

/** The ladders the API serves as ranked tables. */
export const brackets = ["1v1", "2v2", "3v3"] as const
export type Bracket = (typeof brackets)[number]

export const regions: readonly { value: Region; label: string }[] = [
    { value: "all", label: "Global" },
    { value: "us-e", label: "US-E" },
    { value: "eu", label: "EU" },
    { value: "sea", label: "SEA" },
    { value: "brz", label: "BRZ" },
    { value: "aus", label: "AUS" },
    { value: "us-w", label: "US-W" },
    { value: "jpn", label: "JPN" },
    { value: "sa", label: "SA" },
    { value: "me", label: "ME" },
]

export const bracketLabel = (bracket: Bracket): string => bracket

export const regionLabel = (region: Region): string =>
    regions.find((entry) => entry.value === region)?.label ?? "Global"

/**
 * The canonical URL for a ladder page.
 *
 * The region slot cannot be skipped when a page number follows it, so pages past
 * the first spell out `all` rather than leaving the segment empty — otherwise
 * the page number would land in the region segment.
 */
export const ladderHref = (
    bracket: Bracket,
    region: Region,
    page = 1,
): string => {
    if (page <= 1) {
        return region === "all"
            ? `/rankings/${bracket}`
            : `/rankings/${bracket}/${region}`
    }

    return `/rankings/${bracket}/${region}/${page}`
}

/** Where a player's profile lives. The canonical, indexable page. */
export const playerHref = (playerId: number | string, tab?: string): string =>
    tab ? `/stats/player/${playerId}/${tab}` : `/stats/player/${playerId}`

/** Where a clan's page lives. */
export const clanHref = (clanId: number | string): string =>
    `/stats/clan/${clanId}`

/**
 * The page size the API returns per ladder request.
 *
 * Mirrors the `max_results` the upstream call sends. It exists here only to
 * decide whether a "next" control is worth showing: without it the table would
 * either offer a next page that is always empty, or hide one that has rows.
 */
export const LADDER_PAGE_SIZE = 50

/**
 * The colour a tier chip wears.
 *
 * The value is a CSS custom property rather than a hex literal so the tier ramp
 * stays a projection of the palette instead of a second copy of it — retheming
 * the app retints the ladder for free. The ladder's own ordering is mirrored
 * here (Tin → Valhallan), and anything unrecognised — including the empty
 * string an unranked row carries — falls back to the muted text tone.
 */
export const tierColor = (tier: string): string => {
    switch (tier.trim().toLowerCase()) {
        case "valhallan":
            return "var(--color-accentAlt)"
        case "diamond":
            return "var(--color-accentVar1)"
        case "platinum":
            return "var(--color-success)"
        case "gold":
            return "var(--color-warning)"
        case "bronze":
            return "var(--color-danger)"
        case "silver":
            return "var(--color-text)"
        default:
            return "var(--color-textVar1)"
    }
}

/**
 * Whether a 2v2 row is a real pairing.
 *
 * The API files a solo queue under the same `2v2` list as a team, but with no
 * second player: you queued alone and were handed a random partner, so the row
 * is the player's *own* solo record rather than a team they chose. The signal is
 * a second id of zero, which is the same one the ladder uses to drop the phantom
 * member from a row.
 *
 * The `?? 0` is not defensive noise — the field is typed as a number but a solo
 * row can arrive without it at all.
 */
export const isPairedTeam = (team: {
    readonly brawlhalla_id_two?: number
}): boolean => (team.brawlhalla_id_two ?? 0) > 0
