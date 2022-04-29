import { RankingsLayout } from "ui/stats/rankings/RankingsLayout"
import { SEO } from "../../../components/SEO"
import { Select } from "ui/base/Select"
import { Spinner } from "ui/base/Spinner"
import { Tooltip } from "ui/base/Tooltip"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { usePowerRankings } from "common/hooks/usePowerRankings"
import { useRouter } from "next/router"
import { useSortBy } from "common/hooks/useSortBy"
import type { NextPage } from "next"
import type { PR } from "web-parser/power-rankings/parsePowerRankingsPage"

type PRSortOption =
    | "rank"
    | "name"
    | "earnings"
    | "t1"
    | "t2"
    | "t3"
    | "t8"
    | "t32"

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

    const {
        sortedArray: sortedPowerRankings,
        setSortBy,
        sortBy,
        options: sortOptions,
    } = useSortBy<PR, PRSortOption>(
        powerRankings ?? [],
        {
            rank: { label: "Rank", fn: (a, b) => a.rank - b.rank },
            name: { label: "Name", fn: (a, b) => a.name.localeCompare(b.name) },
            earnings: {
                label: "Earnings (Not implemented)",
                fn: () => 0, // TOODO: Sort by earnings
            },
            t1: { label: "T1", fn: (a, b) => a.t1 - b.t1 },
            t2: { label: "T2", fn: (a, b) => a.t2 - b.t2 },
            t3: { label: "T3", fn: (a, b) => a.t3 - b.t3 },
            t8: { label: "T8", fn: (a, b) => a.t8 - b.t8 },
            t32: { label: "T32", fn: (a, b) => a.t32 - b.t32 },
        },
        "rank",
    )

    const [search, setSearch, immediateSearch] = useDebouncedState("", 250)

    if (isError || (!isLoading && !powerRankings)) return <div>Error</div>

    const filteredlPowerRankings =
        sortedPowerRankings.filter(({ name }) =>
            cleanString(name).toLowerCase().startsWith(search.toLowerCase()),
        ) ?? []

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
            hasSearch
            search={immediateSearch}
            setSearch={setSearch}
            searchPlaceholder="Search player..."
        >
            <SEO
                title={`${
                    region === "all" ? "Global" : region.toUpperCase()
                } ${bracket} Power Rankings • Corehalla`}
                description={`Brawhalla ${
                    region === "all" ? "Global" : region.toUpperCase()
                } ${bracket} Power Rankings • Corehalla`}
            />
            <Select<PRSortOption>
                className="flex-1"
                onChange={setSortBy}
                value={sortBy}
                options={sortOptions}
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
            ) : filteredlPowerRankings.length > 0 ? (
                <div className="rounded-lg overflow-hidden border border-bg mb-4">
                    {filteredlPowerRankings.map((player, i) => (
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
            ) : (
                <Tooltip content="do better >:)">
                    <div className="p-4 text-center text-textVar1">
                        No results found in {bracket} {region.toUpperCase()}{" "}
                        Power Rankings
                    </div>
                </Tooltip>
            )}
        </RankingsLayout>
    )
}

export default Page
