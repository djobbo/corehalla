import { HiArrowUp } from "react-icons/hi"
import {
    KBarAnimator,
    KBarPortal,
    KBarPositioner,
    KBarSearch,
    useKBar,
} from "kbar"
import { MAX_SHOWN_ALIASES } from "@util/constants"
import { RankedPlayerItem } from "./RankedPlayerItem"
import { SearchboxItem } from "./SearchboxItem"
import { Spinner } from "ui/base/Spinner"
import { UserIcon } from "ui/icons"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { css } from "@stitches/react"
import { gaEvent } from "common/analytics/gtag"
import { numericLiteralValidator } from "common/helpers/validators"
import { styled, theme } from "ui/theme"
import { trpc } from "@util/trpc"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { useEffect, useState } from "react"
import { usePlayerSearch } from "@hooks/stats/usePlayerSearch"
import type { Ranking1v1 } from "bhapi/types"

const __DEV = process.env.NODE_ENV === "development"

const ResultsContainer = styled("div", {
    maxHeight: "calc(100vh - 14vh - 100px)",
})

type AliasesSubtitleProps = {
    immediateSearch: string
    aliases?: string[]
}

const AliasesSubtitle = ({
    immediateSearch,
    aliases,
}: AliasesSubtitleProps) => {
    if (!aliases || aliases.length === 0) {
        return null
    }

    return (
        <span className="flex gap-1">
            {aliases.map((alias) => {
                const cleanAlias = cleanString(alias)

                if (cleanAlias.length < 2 || cleanAlias.endsWith("•2")) return

                return (
                    <span
                        key={cleanAlias}
                        className={cn({
                            "font-semibold": cleanAlias
                                .toLowerCase()
                                .startsWith(immediateSearch.toLowerCase()),
                        })}
                    >
                        {cleanAlias}
                    </span>
                )
            })}
        </span>
    )
}

export const Searchbox = () => {
    const [rankings, setRankings] = useState<Ranking1v1[]>([])
    const [search, setSearch, immediateSearch, isDebouncingSearch] =
        useDebouncedState("", __DEV ? 250 : 750)

    const { rankings1v1, aliases, isLoading } = usePlayerSearch(search)

    const isPotentialBrawlhallaId =
        numericLiteralValidator.safeParse(search).success

    const { data: potentialBrawlhallaIdAliases } =
        trpc.getPlayerAliases.useQuery(
            { playerId: search },
            {
                enabled: isPotentialBrawlhallaId,
            },
        )

    const {
        query: { toggle },
    } = useKBar()

    useEffect(() => {
        // open searchbox on "/"
        const onKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === "INPUT") return

            if (e.key === "/") {
                e.preventDefault()
                toggle()
            }
        }

        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [toggle])

    useEffect(() => {
        if (isLoading) return

        gaEvent({
            action: "use_searchbox",
            category: "app",
            label: `player ${search}`,
        })

        setRankings(rankings1v1 ?? [])
    }, [rankings1v1, isLoading, search])

    const filteredRankings = rankings.filter((player) =>
        player.name.toLowerCase().startsWith(immediateSearch.toLowerCase()),
    )

    const categoryTitleClassName =
        "text-xs font-semibold text-textVar1 px-4 py-2"

    return (
        <KBarPortal>
            <KBarPositioner className="z-20 bg-bgVar2/50">
                <KBarAnimator className="w-full max-w-screen-md">
                    <div className="rounded-lg overflow-hidden mx-auto bg-bgVar2/[0.98] border border-bg">
                        <div className="relative">
                            <KBarSearch
                                className="p-4 w-full bg-bgVar2 text-text outline-none border-b border-b-bg"
                                defaultPlaceholder="Search player by name or brawlhalla id..."
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                }}
                                value={search}
                            />
                            {immediateSearch.length > 0 &&
                                (isLoading || isDebouncingSearch) && (
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
                        {/* TODO: add tabs for searching for clans, tournaments, etc */}
                        <ResultsContainer className="overflow-y-auto">
                            <div className="max-h-[50vh] my-2">
                                {immediateSearch &&
                                (rankings.length > 0 ||
                                    aliases.length > 0 ||
                                    isPotentialBrawlhallaId) ? (
                                    <>
                                        {isPotentialBrawlhallaId && (
                                            <>
                                                <p
                                                    className={
                                                        categoryTitleClassName
                                                    }
                                                >
                                                    Search by Brawlhalla ID
                                                </p>
                                                <SearchboxItem
                                                    icon={<UserIcon />}
                                                    href={`/stats/player/${search}`}
                                                    title={`Player#${search}`}
                                                    subtitle={
                                                        <AliasesSubtitle
                                                            immediateSearch={
                                                                immediateSearch
                                                            }
                                                            aliases={potentialBrawlhallaIdAliases?.slice(
                                                                0,
                                                                MAX_SHOWN_ALIASES,
                                                            )}
                                                        />
                                                    }
                                                />
                                            </>
                                        )}
                                        {filteredRankings.length > 0 && (
                                            <>
                                                <p
                                                    className={
                                                        categoryTitleClassName
                                                    }
                                                >
                                                    Ranked players
                                                </p>
                                                {filteredRankings.map(
                                                    (player) => (
                                                        <RankedPlayerItem
                                                            key={
                                                                player.brawlhalla_id
                                                            }
                                                            player={player}
                                                        />
                                                    ),
                                                )}
                                            </>
                                        )}
                                        {aliases.length > 0 && (
                                            <>
                                                <p
                                                    className={
                                                        categoryTitleClassName
                                                    }
                                                >
                                                    Other players with similar
                                                    names
                                                </p>
                                                {aliases.map(
                                                    ({
                                                        playerId,
                                                        mainAlias,
                                                        otherAliases,
                                                    }) => (
                                                        <SearchboxItem
                                                            key={playerId}
                                                            icon={
                                                                <UserIcon className="w-8 h-8" />
                                                            }
                                                            href={`/stats/player/${playerId}`}
                                                            title={cleanString(
                                                                mainAlias,
                                                            )}
                                                            subtitle={
                                                                <AliasesSubtitle
                                                                    immediateSearch={
                                                                        immediateSearch
                                                                    }
                                                                    aliases={
                                                                        otherAliases
                                                                    }
                                                                />
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </>
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
                            </div>
                        </ResultsContainer>
                        <p className="text-center text-xs text-textVar1 italic p-2 border-t border-bg">
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
                            if you need help.
                        </p>
                    </div>
                </KBarAnimator>
            </KBarPositioner>
        </KBarPortal>
    )
}
