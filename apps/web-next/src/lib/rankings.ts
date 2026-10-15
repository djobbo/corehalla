import type {
    PowerRankingsGameMode,
    PowerRankingsOrderBy,
    PowerRankingsRegion,
    RankedRegion,
} from "@crh/api-contract/schemas"

type Region = typeof RankedRegion.Type
type PowerRegion = typeof PowerRankingsRegion.Type
type PowerOrder = typeof PowerRankingsOrderBy.Type
export type PowerGameMode = typeof PowerRankingsGameMode.Type
export type PowerOrderBy = PowerOrder

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

export const ladderHref = (
    bracket: Bracket,
    region: Region,
    page = 1,
): string => {
    if (page <= 1) {
        return region === "all"
            ? `/rankings/live/${bracket}`
            : `/rankings/live/${bracket}/${region}`
    }

    return `/rankings/live/${bracket}/${region}/${page}`
}

export const playerHref = (playerId: number | string, tab?: string): string =>
    tab ? `/stats/players/${playerId}/${tab}` : `/stats/players/${playerId}`

export const clanHref = (clanId: number | string): string =>
    `/stats/guilds/${clanId}`

export const powerGameModes: readonly {
    readonly value: PowerGameMode
    readonly label: string
}[] = [
    { value: "1v1", label: "1v1" },
    { value: "2v2", label: "2v2" },
]

/** brawltools region codes; `LAN` is present but currently returns no players. */
export const powerRegions: readonly {
    readonly value: PowerRegion
    readonly label: string
}[] = [
    { value: "NA", label: "NA" },
    { value: "EU", label: "EU" },
    { value: "SA", label: "SA" },
    { value: "SEA", label: "SEA" },
    { value: "MENA", label: "MENA" },
    { value: "LAN", label: "LAN" },
]

export const powerOrderBys: readonly {
    readonly value: PowerOrder
    readonly label: string
}[] = [
    { value: "powerRanking", label: "Power rank" },
    { value: "points", label: "Points" },
    { value: "earnings", label: "Earnings" },
    { value: "gold", label: "Gold medals" },
    { value: "silver", label: "Silver medals" },
    { value: "bronze", label: "Bronze medals" },
    { value: "top8", label: "Top 8 finishes" },
    { value: "top32", label: "Top 32 finishes" },
]

/** Always spells out the path; the route's segments are all optional. */
export const powerHref = (
    gameMode: PowerGameMode,
    region: PowerRegion,
    page = 1,
    orderBy: PowerOrder = "powerRanking",
): string => {
    const base = `/rankings/power/${gameMode}/${region}${
        page > 1 ? `/${page}` : ""
    }`

    return orderBy === "powerRanking" ? base : `${base}?orderBy=${orderBy}`
}

export const LADDER_PAGE_SIZE = 50

export const CAREER_RANKINGS_PAGE_SIZE = 50
export const CLAN_RANKINGS_PAGE_SIZE = 50

export const tierColor = (tier: string): string => {
    // Numbered tiers (`Platinum 3`) share their family's colour.
    switch (
        tier
            .trim()
            .toLowerCase()
            .replace(/\s+\d+$/, "")
    ) {
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
