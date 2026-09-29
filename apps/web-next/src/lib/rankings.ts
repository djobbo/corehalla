import type { RankedRegion } from "@crh/api-contract/schemas"

type Region = typeof RankedRegion.Type

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

export const LADDER_PAGE_SIZE = 50

export const CAREER_RANKINGS_PAGE_SIZE = 50
export const CLAN_RANKINGS_PAGE_SIZE = 50

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
