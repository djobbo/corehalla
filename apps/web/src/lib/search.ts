import {
    powerRankingsRegions,
    rankingsRegions,
} from "@components/stats/rankings/options"
import { rankedRegionSchema } from "./routeSchemas"
import type { PaginatorPage } from "ui/base/Paginator"
import type { RankedRegion } from "./routeSchemas"

/**
 * Brackets whose rankings endpoint accepts a server-side name filter.
 *
 * `2v2`, `global` and `power` have no name filter yet, so they render without
 * a search bar rather than pretending to filter what is already loaded.
 */
export const SEARCHABLE_BRACKETS = ["1v1", "clans"] as const

export const isSearchableBracket = (bracket: string): boolean =>
    (SEARCHABLE_BRACKETS as readonly string[]).includes(bracket)

/**
 * True on a rankings page that renders its own search bar.
 *
 * Exactly one search bar is on screen at a time: it keeps the view-transition
 * name unique, and there is no point showing the header pill next to the real
 * thing.
 */
export const isSearchableRankingsPath = (pathname: string): boolean =>
    /^\/rankings\/(1v1|clans)(\/|$)/.test(pathname)

export type SearchContext = {
    bracket: string
    region: RankedRegion
}

export const DEFAULT_SEARCH_CONTEXT: SearchContext = {
    bracket: "1v1",
    region: "all",
}

/**
 * Builds the rankings URL that shows results for a query.
 *
 * Search and rankings are the same surface: the query is just another filter
 * on the rankings route, so a result set is always a normal, shareable
 * rankings URL.
 */
export const searchHref = ({
    bracket,
    region,
    q,
}: SearchContext & { q?: string }): string => {
    const base =
        bracket === "clans"
            ? "/rankings/clans"
            : region === "all"
              ? `/rankings/${bracket}`
              : `/rankings/${bracket}/${region}`
    const query = q?.trim()

    return query ? `${base}?q=${encodeURIComponent(query)}` : base
}

/**
 * Picks the bracket and region a search should target, based on the page the
 * user is on (e.g. typing on `/rankings/1v1/eu` searches the EU 1v1 table).
 *
 * Non-searchable brackets fall back to the searchable table that is closest to
 * what the user was looking at, keeping the region when it is known.
 */
export const deriveSearchContext = (pathname: string): SearchContext => {
    const segments = pathname.split("/").filter(Boolean)

    if (segments[0] !== "rankings") return DEFAULT_SEARCH_CONTEXT

    const bracket = segments[1]

    if (bracket === "clans") {
        return { bracket: "clans", region: "all" }
    }

    const regionSegment = segments[2]
    const region =
        regionSegment && rankedRegionSchema.safeParse(regionSegment).success
            ? (regionSegment as RankedRegion)
            : "all"

    return {
        bracket: isSearchableBracket(bracket ?? "")
            ? (bracket as string)
            : "1v1",
        region,
    }
}

const searchFocusKey = "corehalla:focus-search"
const searchEntryKey = "corehalla:search-entry"

/**
 * Marks that the next search bar to mount should take focus.
 *
 * The header pill hands off to the rankings search bar on the first keystroke;
 * the bar is a different component on a different route, so the intent has to
 * survive the navigation.
 */
export const requestSearchFocus = (): void => {
    if (typeof window !== "undefined")
        window.sessionStorage.setItem(searchFocusKey, "1")
}

export const consumeSearchFocus = (): boolean => {
    if (typeof window === "undefined") return false

    const pending = window.sessionStorage.getItem(searchFocusKey) === "1"
    if (pending) window.sessionStorage.removeItem(searchFocusKey)

    return pending
}

/**
 * Remembers the page search was entered from, so Esc can go back to it with a
 * normal router navigation (a `history.back()` cannot be wrapped in a view
 * transition without the browser deferring the pop and freezing the snapshot).
 */
export const markSearchEntry = (href: string): void => {
    if (typeof window !== "undefined") {
        window.sessionStorage.setItem(searchEntryKey, href)
    }
}

/** Returns the remembered page and clears it, or null when there is none. */
export const consumeSearchEntry = (): string | null => {
    if (typeof window === "undefined") return null

    const href = window.sessionStorage.getItem(searchEntryKey)
    if (href) window.sessionStorage.removeItem(searchEntryKey)

    return href
}

/** Where a bracket/region pair lives, keeping `?q=` off the caller's hands. */
export const bracketHref = (bracket: string, region: string): string => {
    if (bracket === "clans") return "/rankings/clans"
    if (bracket.startsWith("power/")) return `/rankings/${bracket}/${region}`

    return region === "all"
        ? `/rankings/${bracket}`
        : `/rankings/${bracket}/${region}`
}

/** Regions a bracket accepts; `null` when it has none (clans). */
export const regionsForBracket = (bracket: string): PaginatorPage[] | null => {
    if (bracket === "clans") return null

    return bracket.startsWith("power/") ? powerRankingsRegions : rankingsRegions
}

/** `PaginatorPage[]` -> dropdown options, flattening ReactNode labels. */
export const toPillOptions = (pages: PaginatorPage[] | null) =>
    (pages ?? []).map(({ page, label }) => ({
        value: page,
        label: typeof label === "string" ? label : page,
    }))
