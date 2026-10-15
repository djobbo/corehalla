import { powerOrderBys, powerRegions, regions } from "./rankings"
import { parseEntityId } from "@crh/common/helpers/entitySlug"
import { legends, legendsMap } from "@crh/bhapi/legends"
import { weapons } from "@crh/bhapi/constants"
import type { PowerRankingsOrderBy } from "@crh/api-contract/schemas"
import type { RankedRegion } from "@crh/api-contract/schemas"
import type { Ladder } from "@crh/api-contract/schemas"
import type { Weapon } from "@crh/bhapi/constants"
import type { PowerGameMode } from "./rankings"

/** Schema is a value; its decoded type is `.Type`. */
type Region = typeof RankedRegion.Type
type PowerRegion = (typeof powerRegions)[number]["value"]

const validRegions = new Set<string>(regions.map((entry) => entry.value))

/** Unknown/unparseable segments coerce to a default rather than 404. */
export const resolveRegion = (value?: string): Region =>
    value && validRegions.has(value) ? (value as Region) : "all"

export const resolvePage = (value?: string): number => {
    const page = Number.parseInt(value ?? "1", 10)

    return Number.isFinite(page) && page > 0 ? page : 1
}

export const resolvePowerGameMode = (value?: string): PowerGameMode =>
    value === "2v2" ? "2v2" : "1v1"

export const resolvePowerRegion = (value?: string): PowerRegion =>
    value !== undefined && powerRegions.some((entry) => entry.value === value)
        ? (value as PowerRegion)
        : "NA"

export const resolvePowerOrderBy = (value: unknown): PowerRankingsOrderBy =>
    powerOrderBys.some((entry) => entry.value === value)
        ? (value as PowerRankingsOrderBy)
        : "powerRanking"

export const legendOptions: readonly { value: string; label: string }[] =
    legends.map((legend) => ({
        value: String(legend.legend_id),
        label: legend.bio_name,
    }))

export const resolveLegendId = (value: unknown): number => {
    const id = Number(value)

    return legendsMap[id] === undefined ? legends[0].legend_id : id
}

export const weaponOptions: readonly { value: Weapon; label: string }[] =
    weapons.map((weapon) => ({ value: weapon, label: weapon }))

export const resolveWeapon = (value: unknown): Weapon =>
    (weapons as readonly string[]).includes(String(value))
        ? (String(value) as Weapon)
        : weapons[0]

const ladders = ["1v1", "2v2", "3v3"] as const

export const resolveBracket = (value?: string): Ladder =>
    (ladders as readonly string[]).includes(value ?? "")
        ? (value as Ladder)
        : "1v1"

/** Parent already rejected a bad slug; `0` is only so the child need not re-throw. */
export const resolveEntityId = (slug: string): number =>
    parseEntityId(slug) ?? 0

/** Rewrites the entity segment only — keeps tab tails on layout routes. */
export const canonicalPath = (
    pathname: string,
    base: "/stats/players" | "/stats/guilds",
    current: string,
    slug: string,
): string => {
    const prefix = `${base}/${current}`

    return pathname.startsWith(prefix)
        ? `${base}/${slug}${pathname.slice(prefix.length)}`
        : `${base}/${slug}`
}
