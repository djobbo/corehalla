import { AppLink } from "@ch/ui/base/AppLink"
import { HiArrowUp } from "react-icons/hi"
import {
    KBarAnimator,
    KBarPortal,
    KBarPositioner,
    KBarSearch,
    useKBar,
} from "kbar"
import { SearchboxItem } from "./SearchboxItem"
import { Spinner } from "@ch/ui/base/Spinner"
import { cn } from "@ch/common/helpers/classnames"
import { css } from "@stitches/react"
import { gaEvent } from "@ch/common/analytics/gtag"
import { styled, theme } from "@ch/ui/theme"
import { useDebouncedState } from "@ch/common/hooks/useDebouncedState"
import { useEffect, useState } from "react"
import { usePlayerSearch } from "@hooks/stats/usePlayerSearch"
import type { Ranking1v1 } from "@ch/bhapi/types"

const __DEV = process.env.NODE_ENV === "development"

const ResultsContainer = styled("div", {
    maxHeight: "calc(100vh - 14vh - 100px)",
})

export const Searchbox = () => {
    const [rankings, setRankings] = useState<Ranking1v1[]>([])
    const [search, setSearch, immediateSearch, isDebouncingSearch] =
        useDebouncedState("", __DEV ? 250 : 750)

    const { rankings1v1, aliases, isLoading } = usePlayerSearch(search)

    const isPotentialBrawlhallaId = !!search.match(/^\d+$/g)

    useEffect(() => {
        if (isLoading) return

        gaEvent({
            action: "use_searchbox",
            category: "app",
            label: `player ${search}`,
        })

        setRankings(rankings1v1 ?? [])
    }, [rankings1v1, isLoading, search])

    const {
        query: { toggle },
    } = useKBar()

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
                                defaultPlaceholder="Search player by name or brawlhalla id..."
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
                            {immediateSearch &&
                            (rankings.length > 0 ||
                                aliases.length > 0 ||
                                isPotentialBrawlhallaId) ? (
                                <>
                                    {isPotentialBrawlhallaId && (
                                        <AppLink
                                            href={`/stats/player/${search}`}
                                            onClick={() => toggle()}
                                            className="block p-4 gap-2"
                                        >
                                            <span className="px-2 py-1 bg-bg rounded-md">
                                                View Player#{search} stats
                                            </span>
                                        </AppLink>
                                    )}
                                    {rankings
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
                                        ))}
                                    {aliases.length > 0 && (
                                        <div className="border-t border-bg">
                                            <span className="px-4 text-xs text-textVar1">
                                                players that used{" "}
                                                <span className="bg-bgVar2 p-0.5">
                                                    {search}
                                                </span>{" "}
                                                as an alias
                                            </span>
                                            <div className="flex flex-wrap px-4 py-2 gap-2">
                                                {aliases.map(
                                                    ({ alias, playerId }) => (
                                                        <AppLink
                                                            href={`/stats/player/${playerId}`}
                                                            onClick={() =>
                                                                toggle()
                                                            }
                                                            key={playerId}
                                                            className="px-2 py-1 bg-bg rounded-md"
                                                        >
                                                            {alias}{" "}
                                                            <span className="uppercase text-xs text-textVar1">
                                                                (id: {playerId})
                                                            </span>
                                                        </AppLink>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center px-4 py-8 w-full gap-2">
                                    <HiArrowUp className="w-4 h-4" />
                                    <p className="text-center text-sm mx-4">
                                        {!!immediateSearch &&
                                            !isLoading &&
                                            !isDebouncingSearch && (
                                                <>
                                                    <span className="block text-lg font-semibold mb-2 text-text">
                                                        No players found
                                                    </span>
                                                </>
                                            )}
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
                            <p className="text-center text-xs text-textVar1 italic p-2">
                                If you{"'"}re having trouble finding a player by
                                name, trying using their brawlhalla id instead.
                                <br />
                                Join our{" "}
                                <a
                                    href="/discord"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-textVar1 underline"
                                >
                                    Discord
                                </a>{" "}
                                for help.
                            </p>
                        </ResultsContainer>
                    </div>
                </KBarAnimator>
            </KBarPositioner>
        </KBarPortal>
    )
}
