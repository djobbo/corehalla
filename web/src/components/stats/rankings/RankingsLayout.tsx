import { HiGlobe } from "@react-icons/all-files/hi/HiGlobe"
import { AdsenseRankings } from "common/analytics/Adsense"
import { PillSelect } from "@components/search/PillSelect"
import { Rankings1v1Icon } from "ui/icons"
import { SearchBar } from "@components/search/SearchBar"
import { bracketHref, toPillOptions } from "@/lib/search"
import { useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"
import type { PaginatorPage } from "ui/base/Paginator"

type RankingsLayoutProps = {
    children: ReactNode
    /** The bracket currently shown, e.g. `1v1`, `power/2v2` or `clans`. */
    currentBracket: string
    /** Every selectable bracket, in menu order. */
    brackets: PaginatorPage[]
    currentRegion?: string
    /** `null` for brackets without regions (clans). */
    regions: PaginatorPage[] | null
    /**
     * Present only on tables whose endpoint supports a name filter; the bar is
     * the shared one, so there is a single search setup across the app.
     */
    search?: {
        value: string
        onChange: (value: string) => void
        /** Esc: leave search mode (falls back to clearing the query). */
        onEscape?: () => void
        placeholder?: string
    }
    /** Kept across bracket/region changes so the query survives. */
    searchQuery?: string
    defaultRegion?: string
    defaultBracket?: string
}

/**
 * Shared chrome for every rankings table.
 *
 * The filters are dropdowns that live inside the search box (or, on tables
 * without a name filter, in the same place on their own). Selecting one is a
 * router navigation, so the URL always describes what is on screen.
 */
export const RankingsLayout = ({
    children,
    brackets,
    currentBracket,
    regions,
    currentRegion,
    search,
    searchQuery,
    defaultRegion = "all",
    defaultBracket = "1v1",
}: RankingsLayoutProps) => {
    const navigate = useNavigate()

    const region = regions
        ? regions.some(({ page }) => page === currentRegion)
            ? currentRegion
            : defaultRegion
        : null
    const bracket = brackets.some(({ page }) => page === currentBracket)
        ? currentBracket
        : defaultBracket

    const go = (href: string) =>
        navigate({
            to: (searchQuery
                ? `${href}?q=${encodeURIComponent(searchQuery)}`
                : href) as never,
        })

    const regionOptions = toPillOptions(regions)
    const bracketOptions = toPillOptions(brackets)

    const filters = (
        <>
            {regionOptions.length > 0 && (
                <PillSelect
                    ariaLabel="Region"
                    variant="ghost"
                    align="end"
                    icon={<HiGlobe className="h-4 w-4" />}
                    value={region ?? defaultRegion}
                    options={regionOptions}
                    onChange={(next) => go(bracketHref(bracket, next))}
                />
            )}
            <PillSelect
                ariaLabel="Bracket"
                variant="ghost"
                align="end"
                icon={<Rankings1v1Icon className="h-4 w-4" />}
                value={bracket}
                options={bracketOptions}
                onChange={(next) =>
                    go(bracketHref(next, region ?? defaultRegion))
                }
            />
        </>
    )

    return (
        <div className="relative">
            {/*
             * `isolate` keeps the glow's `-z-10` local, and the positive
             * `z-index` lifts the whole search area — including the PillSelect
             * dropdown, whose `z-30` is otherwise trapped inside this stacking
             * context — above the ad unit below it and the table.
             */}
            <div className="relative isolate z-20 mx-auto mt-4 w-full max-w-3xl">
                {/* Same glow as the landing hero, so the bar reads as the same
                    element in both places. */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-56 w-[40rem] max-w-full rounded-full bg-accent/20 blur-[120px]"
                />
                <SearchBar
                    value={search?.value ?? ""}
                    onChange={search?.onChange ?? (() => {})}
                    onEscape={search?.onEscape}
                    placeholder={
                        search?.placeholder ??
                        "Search player by name or Brawlhalla ID..."
                    }
                    filters={filters}
                    disabled={!search}
                    disabledHint="Search isn't available for this table yet"
                />
            </div>
            {/* Small unit between the search bar and the table. Renders nothing
                (and leaves no gap) when ads are off. */}
            <AdsenseRankings className="mx-auto mt-6 max-w-3xl" />
            <div className="py-4">{children}</div>
        </div>
    )
}
