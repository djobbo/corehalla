import { Pagination } from "ui/base/Pagination"
import { RankingsTableItem } from "ui/stats/RankingsTableItem"
import { Spinner } from "ui/base/Spinner"
import { cleanString } from "common/helpers/cleanString"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import { useRankings2v2 } from "bhapi/hooks/useRankings"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import type { NextPage } from "next"

const Page: NextPage = () => {
    const router = useRouter()

    const { rankingsOptions } = router.query

    const [region = "all", page = "1"] = Array.isArray(rankingsOptions)
        ? rankingsOptions
        : []

    const { rankings2v2, isLoading, isError } = useRankings2v2(
        // @ts-expect-error TODO: Typecheck this
        "2v2",
        region,
        page,
    )

    if (isError || (!isLoading && !rankings2v2)) return <div>Error</div>

    return (
        <>
            <Head>
                <title>{`${
                    region === "all" ? "Global" : region.toUpperCase()
                } 2v2 Rankings - Page ${page} • Corehalla`}</title>
            </Head>
            <Pagination
                getPageHref={(page) =>
                    `/rankings/2v2/${region ?? "all"}/${page}`
                }
                currentPage={parseInt(page)}
                firstPage={1}
                className="justify-end"
            />
            <div className="py-4 w-full h-full flex items-center gap-4">
                <p className="w-16 text-center">Rank</p>
                <p className="w-16 text-center">Region</p>
                <p className="flex-1">Player 1</p>
                <p className="flex-1">Player 2</p>
                <p className="w-16 text-center">Games</p>
                <p className="w-32 text-center">W/L</p>
                <p className="w-20 text-center">Winrate</p>
                <p className="w-40 text-center">Elo</p>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <Spinner size="4rem" />
                </div>
            ) : (
                <div>
                    {rankings2v2?.map((team, i) => {
                        const [player1, player2] = getTeamPlayers(team)
                        return (
                            <RankingsTableItem
                                key={`${player1.id}-${player2.id}`}
                                index={i}
                                content={
                                    <>
                                        <p className="flex flex-1 items-center">
                                            <Link
                                                href={`/stats/player/${player1.id}`}
                                            >
                                                <a>
                                                    {cleanString(player1.name)}
                                                </a>
                                            </Link>
                                        </p>
                                        <p className="flex flex-1 items-center">
                                            <Link
                                                href={`/stats/player/${player2.id}`}
                                            >
                                                <a>
                                                    {cleanString(player2.name)}
                                                </a>
                                            </Link>
                                        </p>
                                    </>
                                }
                                {...team}
                            />
                        )
                    })}
                </div>
            )}
        </>
    )
}

export default Page
