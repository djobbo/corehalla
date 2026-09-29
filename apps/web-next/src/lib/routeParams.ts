import { regions } from "./rankings"
import { parseEntityId } from "@crh/common/helpers/entitySlug"
import { legends, legendsMap } from "@crh/bhapi/legends"
import { weapons } from "@crh/bhapi/constants"
import type { RankedRegion } from "@crh/api-contract/schemas"
import type { Ladder } from "@crh/api-contract/schemas"
import type { Weapon } from "@crh/bhapi/constants"

/** The schema is a value; its decoded type is `Type`. */
type Region = typeof RankedRegion.Type

/**
 * Coerces URL segments into the values the atoms expect.
 *
 * An unknown region or an unparseable page resolves to the default rather than
 * throwing a 404: these segments are user-editable, and a mistyped URL landing
 * on Career page 1 is a better answer than an error page. The canonical URL is
 * what the chip row writes, so a coercing read never becomes a redirect loop.
 */

const validRegions = new Set<string>(regions.map((entry) => entry.value))

export const resolveRegion = (value?: string): Region =>
    value && validRegions.has(value) ? (value as Region) : "all"

export const resolvePage = (value?: string): number => {
    const page = Number.parseInt(value ?? "1", 10)

    return Number.isFinite(page) && page > 0 ? page : 1
}

/** Every legend, as options for the picker. Ids are strings for the `<select>`. */
export const legendOptions: readonly { value: string; label: string }[] =
    legends.map((legend) => ({
        value: String(legend.legend_id),
        label: legend.bio_name,
    }))

/**
 * Coerces a URL value to a legend the archive knows.
 *
 * Validated against the bundled legend table rather than parsed as a number,
 * because the value is a filter on a column: an id nothing uses would return an
 * empty board that looks like "nobody has played this legend" instead of like a
 * bad URL. Defaults to the first legend, so `/rankings/career/legends` is a
 * real page as well as `/rankings/career/legends/3`.
 */
export const resolveLegendId = (value: unknown): number => {
    const id = Number(value)

    return legendsMap[id] === undefined ? legends[0].legend_id : id
}

/** Every weapon, as options for the picker. */
export const weaponOptions: readonly { value: Weapon; label: string }[] =
    weapons.map((weapon) => ({ value: weapon, label: weapon }))

/** Coerces a URL value to a published weapon, defaulting to the first. */
export const resolveWeapon = (value: unknown): Weapon =>
    (weapons as readonly string[]).includes(String(value))
        ? (String(value) as Weapon)
        : weapons[0]

const ladders = ["1v1", "2v2", "3v3"] as const

/**
 * Coerces a URL segment to a bracket, defaulting to the 1v1 ladder.
 *
 * The same call the region and page resolvers make: these segments are
 * user-editable, and landing on the 1v1 queue beats an error page.
 */
export const resolveBracket = (value?: string): Ladder =>
    (ladders as readonly string[]).includes(value ?? "")
        ? (value as Ladder)
        : "1v1"

/**
 * The numeric entity id at the head of a profile slug.
 *
 * Profile URLs are slugs (`1234-bomber`), not bare ids, so a page component
 * cannot pass the segment straight to `Number`. The parent route's loader has
 * already rejected a segment with no id in it, so the `0` here is a value the
 * child can never actually receive — it exists so the child does not have to
 * repeat the parse-and-throw the parent already did.
 */
export const resolveEntityId = (slug: string): number =>
    parseEntityId(slug) ?? 0
