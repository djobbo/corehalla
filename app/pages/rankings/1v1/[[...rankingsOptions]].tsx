import { AppLink } from "ui/base/AppLink"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { RankingsTableItem } from "@components/stats/RankingsTableItem"
import { SEO } from "@components/SEO"
import { Spinner } from "ui/base/Spinner"
import { cleanString } from "common/helpers/cleanString"
import { legendsMap } from "bhapi/legends"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { useEffect } from "react"
import { useRankings1v1 } from "@hooks/stats/useRankings"
import { useRouter } from "next/router"
import Image from "next/image"
import type { NextPage } from "next"

const Page: NextPage = () => {
    const router = useRouter()

    const { rankingsOptions, player = "" } = router.query

    const [search, setSearch, immediateSearch] = useDebouncedState(
        player.toString(),
        500,
    )

    const [region = "all", page = "1"] = Array.isArray(rankingsOptions)
        ? rankingsOptions
        : []

    const { rankings1v1, isLoading, isError } = useRankings1v1(
        // @ts-expect-error TODO: Typecheck this
        region,
        page,
        search,
    )

    useEffect(() => {
        window.history.replaceState(
            "",
            "",
            `/rankings/1v1/${region}/${page}?player=${search}`,
        )
    }, [region, page, search])

    if (isError || (!isLoading && !rankings1v1)) return <div>Error</div>

    return (
        <RankingsLayout
            brackets={[
                { page: "1v1" },
                { page: "2v2" },
                // { page: "switchcraft", label: "Switchcraft" },
                { page: "power/1v1", label: "Power 1v1" },
                { page: "power/2v2", label: "Power 2v2" },
                { page: "clans", label: "Clans" },
            ]}
            currentBracket="1v1"
            regions={[
                { page: "all", label: "Global" },
                { page: "us-e", label: "US-E" },
                { page: "eu", label: "EU" },
                { page: "sea", label: "SEA" },
                { page: "brz", label: "BRZ" },
                { page: "aus", label: "AUS" },
                { page: "us-w", label: "US-W" },
                { page: "jpn", label: "JPN" },
            ]}
            currentRegion={region}
            currentPage={page}
            hasPagination={!search}
            hasSearch
            search={immediateSearch}
            setSearch={setSearch}
            searchPlaceholder="Search player..."
            searchSubtitle="Must start with exact match. Only players that have completed their 10 placement matches are shown."
        >
            <SEO
                title={`Brawlhalla ${
                    region === "all" ? "Global" : region.toUpperCase()
                } 1v1 Rankings - Page ${page}${
                    search ? ` - ${search}` : ""
                } • Corehalla`}
                description={`Brawhalla ${
                    region === "all" ? "Global" : region.toUpperCase()
                } 1v1 Rankings - Page ${page}${
                    search ? ` - ${search}` : ""
                } • Corehalla`}
            />
            <div className="py-4 w-full h-full items-center gap-4 hidden md:flex">
                <p className="w-16 text-center">Rank</p>
                <p className="w-16 text-center">Region</p>
                <p className="flex-1">Name</p>
                <p className="w-16 text-center">Games</p>
                <p className="w-32 text-center">W/L</p>
                <p className="w-20 text-center">Winrate</p>
                <p className="w-40 pl-1">Elo</p>
            </div>
            {isLoading && !rankings1v1 ? (
                <div className="flex items-center justify-center h-48">
                    <Spinner size="4rem" />
                </div>
            ) : (
                <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
                    {rankings1v1
                        ?.filter((player) =>
                            player.name
                                .toLowerCase()
                                .startsWith(immediateSearch),
                        )
                        .map((player, i) => {
                            const legend = legendsMap[player.best_legend]

                            return (
                                <RankingsTableItem
                                    key={player.brawlhalla_id}
                                    index={i}
                                    content={
                                        <AppLink
                                            href={`/stats/player/${player.brawlhalla_id}`}
                                            className="flex flex-1 items-center gap-2 md:gap-3"
                                        >
                                            <div className="relative w-6 h-6 rounded-lg overflow-hidden">
                                                {legend && (
                                                    <Image
                                                        src={`/images/icons/roster/legends/${legend.legend_name_key}.png`}
                                                        alt={legend.bio_name}
                                                        layout="fill"
                                                        objectFit="cover"
                                                        objectPosition="center"
                                                    />
                                                )}
                                            </div>
                                            {cleanString(player.name)}
                                        </AppLink>
                                    }
                                    {...player}
                                />
                            )
                        })}
                </div>
            )}
        </RankingsLayout>
    )
}

export default Page
