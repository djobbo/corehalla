import { Pagination } from "ui/base/Pagination"
import { RankingsTableItem } from "ui/stats/RankingsTableItem"
import { SEO } from "../../../components/SEO"
import { Spinner } from "ui/base/Spinner"
import { cleanString } from "common/helpers/cleanString"
import { legendsMap } from "bhapi/legends"
import { useRankings1v1 } from "bhapi/hooks/useRankings"
import { useRouter } from "next/router"
import Image from "next/image"
import Link from "next/link"
import type { NextPage } from "next"

const Page: NextPage = () => {
    const router = useRouter()

    const { rankingsOptions, player = "" } = router.query

    const [region = "all", page = "1"] = Array.isArray(rankingsOptions)
        ? rankingsOptions
        : []

    const { rankings1v1, isLoading, isError } = useRankings1v1(
        // @ts-expect-error TODO: Typecheck this
        "1v1",
        region,
        page,
        player,
    )

    if (isError || (!isLoading && !rankings1v1)) return <div>Error</div>

    return (
        <>
            <SEO
                title={`${
                    region === "all" ? "Global" : region.toUpperCase()
                } 1v1 Rankings - Page ${page} • Corehalla`}
                description={`Brawhalla ${
                    region === "all" ? "Global" : region.toUpperCase()
                } 1v1 Rankings - Page ${page} • Corehalla`}
            />
            {!player && (
                <Pagination
                    getPageHref={(page) =>
                        `/rankings/1v1/${region ?? "all"}/${page}`
                    }
                    currentPage={parseInt(page)}
                    firstPage={1}
                    className="justify-end"
                />
            )}
            <div className="py-4 w-full h-full flex items-center gap-4">
                <p className="w-16 text-center">Rank</p>
                <p className="w-16 text-center">Region</p>
                <p className="flex-1">Name</p>
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
                    {rankings1v1?.map((player, i) => {
                        const legend = legendsMap[player.best_legend]

                        return (
                            <RankingsTableItem
                                key={player.brawlhalla_id}
                                index={i}
                                content={
                                    <Link
                                        href={`/stats/player/${player.brawlhalla_id}`}
                                    >
                                        <a className="flex flex-1 items-center gap-4">
                                            <div className="relative w-6 h-6 rounded-lg overflow-hidden">
                                                {legend && (
                                                    <Image
                                                        src={`/images/icons/roster/legends/${legend.bio_name}.png`}
                                                        alt={legend.bio_name}
                                                        layout="fill"
                                                        objectFit="cover"
                                                        objectPosition="center"
                                                    />
                                                )}
                                            </div>
                                            {cleanString(player.name)}
                                        </a>
                                    </Link>
                                }
                                {...player}
                            />
                        )
                    })}
                </div>
            )}
        </>
    )
}

export default Page
