import { AppLink } from "ui/base/AppLink"
import { CLANS_PER_PAGE } from "@util/constants"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { SEO } from "@components/SEO"
import { Spinner } from "ui/base/Spinner"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { formatUnixTime } from "common/helpers/date"
import { useClansRankings } from "@hooks/stats/useClansRankings"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { useEffect } from "react"
import { useRouter } from "next/router"
import type { NextPage } from "next"

const ClansPage: NextPage = () => {
    const router = useRouter()

    const { clansOptions, clan = "" } = router.query

    const [search, setSearch, immediateSearch] = useDebouncedState(
        clan.toString(),
        500,
    )

    const [page = "1"] = Array.isArray(clansOptions) ? clansOptions : []

    const { clans, isLoading, isError } = useClansRankings(page, search)

    useEffect(() => {
        window.history.replaceState(
            "",
            "",
            `/rankings/clans/${page}?clan=${search}`,
        )
    }, [page, search])

    if (isError || (!isLoading && !clans)) return <div>Error</div>

    const showClanRank = !search

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
            currentBracket="clans"
            regions={null}
            currentPage={page}
            hasPagination={!search}
            hasSearch
            search={immediateSearch}
            setSearch={setSearch}
            searchPlaceholder="Search clan..."
            searchSubtitle="Search by clan name (exactly as it appears in-game). Clan search/rankings is still in early development."
        >
            <SEO
                title={`Brawlhalla Clans - Page ${page} • Corehalla`}
                description={`Brawhalla Clans - Page ${page} • Corehalla`}
            />
            <div className="p-4 w-full h-full flex items-center gap-4">
                {showClanRank && <p className="w-16 text-center">Rank</p>}
                <p className="flex-1">Name</p>
                <p className="w-40 pl-1 text-center">Created</p>
                <p className="w-20 pl-1 text-center">XP</p>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <Spinner size="4rem" />
                </div>
            ) : (
                <div className="rounded-lg overflow-hidden border border-bg mb-4">
                    {clans.map((clan, index) => (
                        <div
                            key={clan.id}
                            className={cn(
                                "px-4 py-2 w-full h-full flex items-center gap-4 hover:bg-bg",
                                { "bg-bgVar2": index % 2 === 0 },
                            )}
                        >
                            {showClanRank && (
                                <p className="w-16 h-full flex items-center justify-center text-xs">
                                    {(parseInt(page, 10) - 1) * CLANS_PER_PAGE +
                                        index +
                                        1}
                                </p>
                            )}
                            <p className="flex flex-1 items-center">
                                <AppLink href={`/stats/clan/${clan.id}`}>
                                    {cleanString(clan.name)}
                                </AppLink>
                            </p>
                            <div className="w-40 flex items-center justify-start">
                                {formatUnixTime(clan.created)}
                            </div>
                            <p className="w-20 text-center">{clan.xp}</p>
                        </div>
                    ))}
                </div>
            )}
        </RankingsLayout>
    )
}

export default ClansPage
