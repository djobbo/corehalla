import { HiGlobe } from "@react-icons/all-files/hi/HiGlobe"
import { AdsenseLandingSearch } from "common/analytics/Adsense"
import { AnimatedLogo } from "ui/base/AnimatedLogo"
import { AppLink } from "ui/base/AppLink"
import { PillSelect } from "@components/search/PillSelect"
import { Rankings1v1Icon } from "ui/icons"
import { SearchBar } from "@components/search/SearchBar"
import { rankingsBrackets } from "@components/stats/rankings/options"
import { regionsForBracket, toPillOptions } from "@/lib/search"
import { useSearchHandoff } from "common/hooks/useSearchHandoff"
import { useState } from "react"
import type { RankedRegion } from "@/lib/routeSchemas"

const BRACKET_OPTIONS = toPillOptions(rankingsBrackets)

/**
 * The landing search entry.
 *
 * The same bar and the same bracket/region dropdowns as the rankings pages;
 * the selection here decides which table the click (or first keystroke) opens.
 */
export const HarnessComposer = () => {
    const { value, setValue, enterSearch } = useSearchHandoff()
    const [bracket, setBracket] = useState("1v1")
    const [region, setRegion] = useState<RankedRegion>("all")

    const regionOptions = toPillOptions(regionsForBracket(bracket))

    const selectBracket = (next: string) => {
        setBracket(next)
        // Clans have no region, so a stale one would leak into the URL.
        if (!regionsForBracket(next)) setRegion("all")
    }

    const filters = (
        <>
            {regionOptions.length > 0 && (
                <PillSelect
                    ariaLabel="Region"
                    variant="ghost"
                    align="end"
                    icon={<HiGlobe className="h-4 w-4" />}
                    value={region}
                    options={regionOptions}
                    // Options come from the shared region lists, which are
                    // already validated against `RankedRegion`.
                    onChange={(next) => setRegion(next as RankedRegion)}
                />
            )}
            <PillSelect
                ariaLabel="Bracket"
                variant="ghost"
                align="end"
                icon={<Rankings1v1Icon className="h-4 w-4" />}
                value={bracket}
                options={BRACKET_OPTIONS}
                onChange={selectBracket}
            />
        </>
    )

    return (
        <section className="relative isolate px-2 py-12 sm:py-16 lg:py-20">
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-16 -z-10 h-56 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]"
            />
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
                <div className="flex items-center justify-center gap-3">
                    <AnimatedLogo size={40} />
                    <h1 className="text-3xl font-bold sm:text-4xl">
                        Corehalla
                    </h1>
                </div>
                <p className="mt-4 max-w-xl text-center text-sm text-textVar1 sm:text-base">
                    Search players and clans across the live Brawlhalla
                    rankings.
                </p>
                <div className="mt-8 w-full">
                    <SearchBar
                        value={value}
                        onChange={(next) => {
                            setValue(next)
                            enterSearch(next, { bracket, region })
                        }}
                        onActivate={() => enterSearch("", { bracket, region })}
                        filters={filters}
                    />
                </div>
                <p className="mt-3 text-center text-xs text-textVar1">
                    <AppLink
                        href="/rankings"
                        className="underline hover:text-text"
                    >
                        Browse the live leaderboards
                    </AppLink>
                    {" · "}
                    <AppLink
                        href="/discord"
                        target="_blank"
                        className="underline hover:text-text"
                    >
                        Join the Discord
                    </AppLink>
                </p>
                {/* Same small unit as the rankings pages, just below the bar. */}
                <AdsenseLandingSearch className="mt-6 w-full" />
            </div>
        </section>
    )
}
