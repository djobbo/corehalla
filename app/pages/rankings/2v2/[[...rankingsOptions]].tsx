import { AppLink } from "ui/base/AppLink"
import { RankingsLayout } from "@corehalla/core/src/components/stats/rankings/RankingsLayout"
import { RankingsTableItem } from "@corehalla/core/src/components/stats/RankingsTableItem"
import { SEO } from "@corehalla/core/src/components/SEO"
import { Spinner } from "ui/base/Spinner"
import { cleanString } from "common/helpers/cleanString"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import { useRankings2v2 } from "@corehalla/core/src/hooks/stats/useRankings"
import { useRouter } from "next/router"
import type { NextPage } from "next"

const Page: NextPage = () => {
    const router = useRouter()

    const { rankingsOptions } = router.query

    const [region = "all", page = "1"] = Array.isArray(rankingsOptions)
        ? rankingsOptions
        : []

    const { rankings2v2, isLoading, isError } = useRankings2v2(
        // @ts-expect-error TODO: Typecheck this
        region,
        page,
    )

    if (isError || (!isLoading && !rankings2v2)) return <div>Error</div>

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
            currentBracket="2v2"
            regions={[
                { page: "all", label: "Global" },
                { page: "us-e", label: "US-E" },
                { page: "eu", label: "EU" },
                { page: "sea", label: "SEA" },
                { page: "brz", label: "BRZ" },
                { page: "aus", label: "AUS" },
                { page: "us-w", label: "US-W" },
                { page: "jpn", label: "JPN" },
                { page: "sa", label: "SA" },
                { page: "me", label: "ME" },
            ]}
            currentRegion={region}
            currentPage={page}
            hasPagination
        >
            <SEO
                title={`Brawlhalla ${
                    region === "all" ? "Global" : region.toUpperCase()
                } 2v2 Rankings - Page ${page} • Corehalla`}
                description={`Brawhalla ${
                    region === "all" ? "Global" : region.toUpperCase()
                } 2v2 Rankings - Page ${page} • Corehalla`}
            />
            <div className="py-4 w-full h-full hidden md:flex items-center gap-4">
                <p className="w-16 text-center">Rank</p>
                <p className="w-8 text-center">Tier</p>
                <p className="w-16 text-center">Region</p>
                <p className="flex-1">Player 1</p>
                <p className="flex-1">Player 2</p>
                <p className="w-16 text-center">Games</p>
                <p className="w-32 text-center">W/L</p>
                <p className="w-20 text-center">Winrate</p>
                <p className="w-40 pl-1">Elo</p>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <Spinner size="4rem" />
                </div>
            ) : (
                <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
                    {rankings2v2?.map((team, i) => {
                        const [player1, player2] = getTeamPlayers(team)
                        return (
                            <RankingsTableItem
                                key={`${player1.id}-${player2.id}`}
                                index={i}
                                content={
                                    <>
                                        <p className="flex flex-1 items-center">
                                            <AppLink
                                                href={`/stats/player/${player1.id}`}
                                            >
                                                {cleanString(player1.name)}
                                            </AppLink>
                                        </p>
                                        <p className="flex flex-1 items-center">
                                            <AppLink
                                                href={`/stats/player/${player2.id}`}
                                            >
                                                {cleanString(player2.name)}
                                            </AppLink>
                                        </p>
                                    </>
                                }
                                {...team}
                            />
                        )
                    })}
                </div>
            )}
        </RankingsLayout>
    )
}

export default Page
