import { regions } from "./rankings"
import type { RankedRegion } from "@crh/api-contract/schemas"

/** The schema is a value; its decoded type is `Type`. */
type Region = typeof RankedRegion.Type

/**
 * Coerces URL segments into the values the atoms expect.
 *
 * An unknown region or an unparseable page resolves to the default rather than
 * throwing a 404: these segments are user-editable, and a mistyped URL landing
 * on Global page 1 is a better answer than an error page. The canonical URL is
 * what the chip row writes, so a coercing read never becomes a redirect loop.
 */

const validRegions = new Set<string>(regions.map((entry) => entry.value))

export const resolveRegion = (value?: string): Region =>
    value && validRegions.has(value) ? (value as Region) : "all"

export const resolvePage = (value?: string): number => {
    const page = Number.parseInt(value ?? "1", 10)

    return Number.isFinite(page) && page > 0 ? page : 1
}
