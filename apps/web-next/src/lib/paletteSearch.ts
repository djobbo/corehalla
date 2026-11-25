import { legends } from "@crh/bhapi/legends"
import { weapons } from "@crh/bhapi/constants"
import type { Weapon } from "@crh/bhapi/constants"
import type { Legend } from "@crh/bhapi/types"

/** Two characters is enough to surface a legend or weapon; players need more. */
export const MIN_CATALOGUE_QUERY_LENGTH = 2

export const CATALOGUE_GROUP_LIMIT = 4

type MatchRank = "prefix" | "substring"

type Ranked<T> = {
    readonly item: T
    readonly rank: MatchRank
    readonly index: number
}

export type CatalogueMatches = {
    readonly legends: readonly Legend[]
    readonly weapons: readonly Weapon[]
}

const fold = (value: string): string =>
    value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()

const rankOf = (field: string, needle: string): MatchRank | null =>
    field.startsWith(needle)
        ? "prefix"
        : field.includes(needle)
          ? "substring"
          : null

const bestRank = (
    fields: readonly string[],
    needle: string,
): MatchRank | null => {
    let best: MatchRank | null = null

    for (const field of fields) {
        const rank = rankOf(fold(field), needle)

        if (rank === "prefix") return "prefix"
        if (rank === "substring") best = "substring"
    }

    return best
}

const rankAll = <T>(
    items: readonly T[],
    query: string,
    rankItem: (item: T, needle: string) => MatchRank | null,
    limit: number,
): readonly T[] => {
    const needle = fold(query.trim())

    if (needle.length < MIN_CATALOGUE_QUERY_LENGTH) return []

    const ranked: Ranked<T>[] = []

    items.forEach((item, index) => {
        const rank = rankItem(item, needle)

        if (rank !== null) ranked.push({ item, rank, index })
    })

    // Equal ranks keep roster order, so the same query always lists the same rows.
    ranked.sort((left, right) =>
        left.rank === right.rank
            ? left.index - right.index
            : left.rank === "prefix"
              ? -1
              : 1,
    )

    return ranked.slice(0, Math.max(limit, 0)).map(({ item }) => item)
}

const legendRank = (legend: Legend, needle: string): MatchRank | null =>
    bestRank([legend.bio_name, legend.bio_aka], needle)

const weaponRank = (weapon: Weapon, needle: string): MatchRank | null =>
    rankOf(fold(weapon), needle)

/**
 * Matching runs client-side over the bundled roster, so legend and weapon rows
 * render immediately and keep working while player lookups are slow or failing.
 */
export const matchLegends = (
    query: string,
    limit = CATALOGUE_GROUP_LIMIT,
): readonly Legend[] => rankAll(legends, query, legendRank, limit)

export const matchWeapons = (
    query: string,
    limit = CATALOGUE_GROUP_LIMIT,
): readonly Weapon[] => rankAll(weapons, query, weaponRank, limit)

export const catalogueMatches = (
    query: string,
    limit = CATALOGUE_GROUP_LIMIT,
): CatalogueMatches => ({
    legends: matchLegends(query, limit),
    weapons: matchWeapons(query, limit),
})
