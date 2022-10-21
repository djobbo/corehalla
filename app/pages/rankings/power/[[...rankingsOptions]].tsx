import { MiscStatGroup } from "@components/stats/MiscStatGroup"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { SEO } from "@components/SEO"
import { Select } from "ui/base/Select"
import { Spinner } from "ui/base/Spinner"
import { Tooltip } from "ui/base/Tooltip"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { usePowerRankings } from "@hooks/stats/usePowerRankings"
import { useRouter } from "next/router"
import { useSortBy } from "common/hooks/useSortBy"
import type { MiscStat } from "@components/stats/MiscStatGroup"
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
            rank: { label: "PR", sortFn: (a, b) => a.rank - b.rank },
            name: { label: "Name", sortFn: (a, b) => a.name.localeCompare(b.name) },
            earnings: {
                label: "Earnings (Not implemented)",
                sortFn: () => 0, // TOODO: Sort by earnings
            },
            t1: { label: "T1", sortFn: (a, b) => b.t1 - a.t1 },
            t2: { label: "T2", sortFn: (a, b) => b.t2 - a.t2 },
            t3: { label: "T3", sortFn: (a, b) => b.t3 - a.t3 },
            t8: { label: "T8", sortFn: (a, b) => b.t8 - a.t8 },
            t32: { label: "T32", sortFn: (a, b) => b.t32 - a.t32 },
        },
        "rank",
    )

    const [search, setSearch, immediateSearch] = useDebouncedState("", 250)

    if (isError || (!isLoading && !powerRankings)) return <div>Error</div>

    const filteredlPowerRankings =
        sortedPowerRankings.filter(({ name }) =>
            cleanString(name).toLowerCase().startsWith(search.toLowerCase()),
        ) ?? []

    const goldMedalists = filteredlPowerRankings.filter(({ t1 }) => t1 > 0)
    const silverMedalists = filteredlPowerRankings.filter(({ t2 }) => t2 > 0)
    const bronzeMedalists = filteredlPowerRankings.filter(({ t3 }) => t3 > 0)
    const podiumedPlayers = filteredlPowerRankings.filter(
        ({ t1, t2, t3 }) => t1 + t2 + t3 > 0,
    )
    const t8Finalists = filteredlPowerRankings.filter(({ t8 }) => t8 > 0)
    const t32Finalists = filteredlPowerRankings.filter(({ t32 }) => t32 > 0)

    const globalStats: MiscStat[] = [
        {
            name: `Players ranked (${region})`,
            value: filteredlPowerRankings.length,
            desc: `${filteredlPowerRankings.length} players ${
                search !== "" ? `starting with ${search}` : ""
            } are currently power ranked`,
        },
        {
            name: `Gold medalists`,
            value: goldMedalists.length,
            desc: `${goldMedalists.length} players ${
                search !== "" ? `starting with ${search}` : ""
            } have a gold medal`,
        },
        {
            name: `Silver medalists`,
            value: silverMedalists.length,
            desc: `${silverMedalists.length} players ${
                search !== "" ? `starting with ${search}` : ""
            } have a silver medal`,
        },
        {
            name: `Bronze medalists`,
            value: bronzeMedalists.length,
            desc: `${bronzeMedalists.length} players ${
                search !== "" ? `starting with ${search}` : ""
            } have a bronze medal`,
        },
        {
            name: `Podiumed players`,
            value: podiumedPlayers.length,
            desc: `${podiumedPlayers.length} players ${
                search !== "" ? `starting with ${search}` : ""
            } have a podium`,
        },
        {
            name: `Top 8 finalists`,
            value: t8Finalists.length,
            desc: `${t8Finalists.length} players ${
                search !== "" ? `starting with ${search}` : ""
            } have a top 8 finish`,
        },
        {
            name: `Top 32 finalists`,
            value: t32Finalists.length,
            desc: `${t32Finalists.length} players ${
                search !== "" ? `starting with ${search}` : ""
            } have a top 32 finish`,
        },
    ]

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
            currentBracket={`power/${bracket}`}
            regions={[
                { page: "us-e", label: "NA" },
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
            defaultRegion="us-e"
        >
            <SEO
                title={`Brawlhalla ${
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
            <MiscStatGroup className="mt-8 mb-4" stats={globalStats} />
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
