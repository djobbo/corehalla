import { HiArrowUp } from "react-icons/hi"
import { KBarAnimator, KBarPortal, KBarPositioner, KBarSearch } from "kbar"
import { SearchboxItem } from "./SearchboxItem"
import { Spinner } from "ui/base/Spinner"
import { cn } from "common/helpers/classnames"
import { css } from "@stitches/react"
import { gaEvent } from "common/analytics/gtag"
import { styled, theme } from "ui/theme"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { useEffect, useState } from "react"
import { useRankings1v1 } from "@hooks/stats/useRankings"
import type { Ranking1v1 } from "bhapi/types"

const __DEV = process.env.NODE_ENV === "development"

const ResultsContainer = styled("div", {
    maxHeight: "calc(100vh - 14vh - 100px)",
})

export const Searchbox = () => {
    const [rankings, setRankings] = useState<Ranking1v1[]>([])
    const [search, setSearch, immediateSearch, isDebouncingSearch] =
        useDebouncedState("", __DEV ? 250 : 750)

    const { rankings1v1, isLoading } = useRankings1v1("all", "1", search, {
        enabled: !!search,
    })

    useEffect(() => {
        if (isLoading) return

        gaEvent({
            action: "use_searchbox",
            category: "app",
            label: `player ${search}`,
        })

        setRankings(rankings1v1 ?? [])
    }, [rankings1v1, isLoading, search])

    return (
        <KBarPortal>
            <KBarPositioner
                className="z-20"
                style={{
                    backgroundColor: "#0004",
                }}
            >
                <KBarAnimator className="w-full max-w-screen-md">
                    <div className="rounded-lg overflow-hidden mx-auto bg-bgVar1">
                        <div className="relative">
                            <KBarSearch
                                className="px-4 py-3 w-full text-bgVar2"
                                defaultPlaceholder="Search player..."
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                }}
                                value={search}
                            />
                            {(isLoading || isDebouncingSearch) && (
                                <Spinner
                                    className={cn(
                                        "absolute",
                                        css({
                                            top: "50%",
                                            right: "0.5rem",
                                            transform: "translateY(-50%)",
                                        })(),
                                    )}
                                    size="2rem"
                                    color={theme.colors.bg.toString()}
                                />
                            )}
                        </div>
                        <ResultsContainer className="h-full overflow-y-auto">
                            {immediateSearch ? (
                                rankings
                                    .filter((player) =>
                                        player.name
                                            .toLowerCase()
                                            .startsWith(
                                                immediateSearch.toLowerCase(),
                                            ),
                                    )
                                    .map((player) => (
                                        <SearchboxItem
                                            key={player.brawlhalla_id}
                                            player={player}
                                        />
                                    ))
                            ) : (
                                <div className="flex items-center justify-center px-4 py-8 w-full gap-2">
                                    <HiArrowUp className="w-4 h-4" />
                                    <p className="text-center text-sm mx-4">
                                        Search for a player (must start with
                                        exact match)
                                        <br />
                                        <span className="text-xs text-textVar1">
                                            Only players that have completed
                                            their 10 placement matches are
                                            shown.
                                        </span>
                                    </p>
                                    <HiArrowUp className="w-4 h-4" />
                                </div>
                            )}
                        </ResultsContainer>
                    </div>
                </KBarAnimator>
            </KBarPositioner>
        </KBarPortal>
    )
}
