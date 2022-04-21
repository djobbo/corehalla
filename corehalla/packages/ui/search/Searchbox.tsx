import { IS_DEV } from "common/helpers/nodeEnv"
import { KBarAnimator, KBarPortal, KBarPositioner, KBarSearch } from "kbar"
import { Spinner } from "../base/Spinner"
import { bg, border, styled, text, theme } from "../theme"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { css } from "@stitches/react"
import { legendsMap } from "bhapi/legends"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { useEffect, useState } from "react"
import { useRankings1v1 } from "bhapi/hooks/useRankings"
import Image from "next/image"
import type { Ranking1v1 } from "bhapi/types"

type SearchboxItemProps = {
    player: Ranking1v1
}

const ResultsContainer = styled("div", {
    maxHeight: "calc(100vh - 14vh - 100px)",
})

const SearchboxItem = ({ player }: SearchboxItemProps) => {
    const legend = legendsMap[player.best_legend]

    const icon = legend && (
        <div className="w-8 h-8 relative" key={legend.legend_id}>
            <Image
                src={`/images/icons/roster/legends/${legend.bio_name}.png`}
                alt={legend.bio_name}
                layout="fill"
                objectFit="contain"
                objectPosition="center"
            />
        </div>
    )

    return (
        <div
            className={cn(
                "px-4 py-3 w-full flex items-center border-b cursor-pointer",
                border("blue4"),
                bg("blue3", "&:hover"),
            )}
        >
            {icon}
            <div className="ml-4">
                <p>{cleanString(player.name)}</p>
                <p className={cn("uppercase text-xs", text("blue11"))}>
                    {player.rating} / {player.peak_rating} peak ({player.tier})
                </p>
            </div>
        </div>
    )
}

export const Searchbox = () => {
    const [rankings, setRankings] = useState<Ranking1v1[]>([])
    const [search, setSearch, immediateSearch, isDebouncingSearch] =
        useDebouncedState("", IS_DEV ? 1500 : 1500)

    const { rankings1v1, isLoading } = useRankings1v1("all", "1", search, {
        enabled: !!search,
    })

    useEffect(() => {
        if (isLoading) return

        setRankings(
            rankings1v1 && !!immediateSearch
                ? rankings1v1.filter((player) =>
                      player.name
                          .toLowerCase()
                          .startsWith(immediateSearch.toLowerCase()),
                  )
                : [],
        )
    }, [rankings1v1, isLoading, immediateSearch])

    return (
        <KBarPortal>
            {/* @ts-expect-error kbar is weird */}
            <KBarPositioner
                className="z-20"
                style={{
                    backgroundColor: "#0004",
                }}
            >
                {/* @ts-expect-error kbar is weird */}
                <KBarAnimator className="w-full max-w-screen-md">
                    <div
                        className={cn(
                            "rounded-lg overflow-hidden border mx-auto",
                            bg("blue2"),
                            border("blue3"),
                        )}
                    >
                        <div className="relative">
                            <KBarSearch
                                className={cn(
                                    "px-4 py-3 w-full",
                                    text("blue3"),
                                )}
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
                                    color={theme.colors.blue6.toString()}
                                />
                            )}
                        </div>
                        <ResultsContainer className="h-full overflow-y-auto">
                            {rankings.map((player) => (
                                <SearchboxItem
                                    key={player.brawlhalla_id}
                                    player={player}
                                />
                            ))}
                        </ResultsContainer>
                    </div>
                </KBarAnimator>
            </KBarPositioner>
        </KBarPortal>
    )
}
