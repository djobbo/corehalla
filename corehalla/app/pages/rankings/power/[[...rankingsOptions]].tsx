import { RankingsLayout } from "ui/stats/rankings/RankingsLayout"
import { SEO } from "../../../components/SEO"
import { Spinner } from "ui/base/Spinner"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { usePowerRankings } from "common/hooks/usePowerRankings"
import { useRouter } from "next/router"
import type { NextPage } from "next"

const Page: NextPage = () => {
    const router = useRouter()

    const { rankingsOptions } = router.query

    const [bracket = "1v1", region = "us-e"] = Array.isArray(rankingsOptions)
        ? rankingsOptions
        : []

    const { powerRankings, isLoading, isError } = usePowerRankings(
        // @ts-expect-error TODO: Typecheck this
        bracket,
        region,
    )

    if (isError || (!isLoading && !powerRankings)) return <div>Error</div>

    return (
        <RankingsLayout
            brackets={[
                { page: "1v1" },
                { page: "2v2" },
                { page: "switchcraft", label: "Switchcraft" },
                { page: "power/1v1", label: "Power 1v1" },
                { page: "power/2v2", label: "Power 2v2" },
            ]}
            currentBracket={`power/${bracket}`}
            regions={[
                { page: "us-e", label: "US-E" },
                { page: "eu", label: "EU" },
                { page: "sea", label: "SEA" },
                { page: "brz", label: "BRZ" },
                { page: "aus", label: "AUS" },
            ]}
            currentRegion={region}
            hasPagination
        >
            <SEO
                title={`${
                    region === "all" ? "Global" : region.toUpperCase()
                } ${bracket} Power Rankings • Corehalla`}
                description={`Brawhalla ${
                    region === "all" ? "Global" : region.toUpperCase()
                } ${bracket} Power Rankings • Corehalla`}
            />
            <div className="py-4 w-full h-full flex items-center gap-4">
                <p className="w-16 text-center">Rank</p>
                <p className="flex-1">Name</p>
                <p className="w-20">Earnings</p>
                <p className="w-16 text-center">Gold</p>
                <p className="w-16 text-center">Silver</p>
                <p className="w-16 text-center">Bronze</p>
                <p className="w-16 text-center">Top 8</p>
                <p className="w-16 text-center">Top 32</p>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <Spinner size="4rem" />
                </div>
            ) : (
                <div className="rounded-lg overflow-hidden border border-bg mb-4">
                    {powerRankings?.map((player, i) => (
                        <div
                            className={cn(
                                "py-1 w-full h-full flex items-center gap-4 hover:bg-bg",
                                {
                                    "bg-bgVar2": i % 2 === 0,
                                },
                            )}
                            key={`${bracket}-${region}-${player.rank}-${player.name}`}
                        >
                            <p className="w-16 text-center">{player.rank}</p>
                            <p className="flex-1">{cleanString(player.name)}</p>
                            <p className="w-20">{player.earnings}</p>
                            <p className="w-16 text-center">{player.t1}</p>
                            <p className="w-16 text-center">{player.t2}</p>
                            <p className="w-16 text-center">{player.t3}</p>
                            <p className="w-16 text-center">{player.t8}</p>
                            <p className="w-16 text-center">{player.t32}</p>
                        </div>
                    ))}
                </div>
            )}
        </RankingsLayout>
    )
}

export default Page
