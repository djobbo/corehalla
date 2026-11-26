import { legends } from "@crh/bhapi/legends"
import { weapons } from "@crh/bhapi/constants"
import type { Weapon } from "@crh/bhapi/constants"
import type { Legend } from "@crh/bhapi/types"
import { clanHref, playerHref } from "./rankings"

/** Two characters is enough to surface a legend or weapon; players need more. */
export const MIN_CATALOGUE_QUERY_LENGTH = 2

export const CATALOGUE_GROUP_LIMIT = 4

/** Three digits is the shortest id anyone can paste from a profile URL. */
export const MIN_ID_QUERY_LENGTH = 3

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

export type PaletteEntity = {
    readonly type: "player" | "clan"
    readonly id: string
    readonly name: string
}

/** A leaderboard, archive or recent row, already resolved to its profile URL. */
export type PaletteEntityRow = {
    readonly key: string
    readonly name: string
    readonly meta: string
    readonly href: string
    readonly entry: PaletteEntity
}

export type IdAction = {
    readonly name: string
    readonly meta: string
    readonly href: string
}

export type PaletteSection =
    | {
          readonly kind: "entities"
          readonly heading: "Recent" | "Rankings" | "Archived players"
          readonly rows: readonly PaletteEntityRow[]
      }
    | {
          readonly kind: "legends"
          readonly heading: "Legends"
          readonly rows: readonly Legend[]
      }
    | {
          readonly kind: "weapons"
          readonly heading: "Weapons"
          readonly rows: readonly Weapon[]
      }
    | {
          readonly kind: "ids"
          readonly heading: "Open by ID"
          readonly rows: readonly IdAction[]
      }

/**
 * The id half of a profile URL is a stable handle, so a pasted id opens the
 * profile directly; the route redirects to the canonical slug once it loads.
 */
export const idLookup = (query: string): readonly IdAction[] => {
    const candidate = query.trim().replace(/^#/, "").trim()

    if (candidate.length < MIN_ID_QUERY_LENGTH || !/^\d+$/.test(candidate)) {
        return []
    }

    const id = Number(candidate)
    const player = playerHref(id)
    const guild = clanHref(id)

    return [
        { name: `Open player #${id}`, meta: player, href: player },
        { name: `Open guild #${id}`, meta: guild, href: guild },
    ]
}

export type PaletteInputs = {
    readonly query: string
    readonly recents: readonly PaletteEntityRow[]
    readonly leaderboard: readonly PaletteEntityRow[]
    readonly archive: readonly PaletteEntityRow[]
}

/**
 * Display order is the contract: ids always come last so a digit string that
 * also names a player never outranks the name.
 */
export const paletteSections = ({
    query,
    recents,
    leaderboard,
    archive,
}: PaletteInputs): readonly PaletteSection[] => {
    const catalogue = catalogueMatches(query)
    const found = new Set(leaderboard.map((row) => row.entry.id))

    const sections: readonly PaletteSection[] = [
        { kind: "entities", heading: "Recent", rows: recents },
        { kind: "entities", heading: "Rankings", rows: leaderboard },
        {
            kind: "entities",
            heading: "Archived players",
            rows: archive.filter((row) => !found.has(row.entry.id)),
        },
        { kind: "legends", heading: "Legends", rows: catalogue.legends },
        { kind: "weapons", heading: "Weapons", rows: catalogue.weapons },
        { kind: "ids", heading: "Open by ID", rows: idLookup(query) },
    ]

    return sections.filter((section) => section.rows.length > 0)
}
