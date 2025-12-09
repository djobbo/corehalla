import { AppLink } from "ui/base/AppLink"
import { CLANS_RANKINGS_PER_PAGE } from "server/helpers/constants"
import { RankingsLayout } from "@corehalla/core/src/components/stats/rankings/RankingsLayout"
import { SEO } from "@corehalla/core/src/components/SEO"
import { Spinner } from "ui/base/Spinner"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { formatUnixTime } from "common/helpers/date"
import { useClansRankings } from "@corehalla/core/src/hooks/stats/useClansRankings"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { useRouter } from "next/router"
import { z } from "zod"
import type { NextPage } from "next"

const ClansPage: NextPage = () => {
    const router = useRouter()

    const { clansOptions, clan } = router.query

    let clanName = ""
    let page = "1"

    // TODO: ZOD (next version) will allow us to do this:
    // const clanName = z.string().catch("").parse(clan)
    try {
        clanName = z.string().parse(clan)
    } catch {
        // do nothing, we use the default value
    }

    try {
        const validClanOptions = z.array(z.string()).parse(clansOptions)
        const [pageToValidate] = validClanOptions

        // TODO: ZOD (next version) will allow us to do this:
        // const validPage = z.string().regex(/^\d+$/).catch("1").parse(pageToValidate)
        const validPage = z.string().regex(/^\d+$/).parse(pageToValidate)

        page = validPage
    } catch {
        // do nothing, we use the default value
    }

    const [search, setSearch, immediateSearch] = useDebouncedState(
        clanName.toString(),
        500,
    )

    const { clans, isLoading, isError } = useClansRankings(page, search)

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
                <p className="w-40 pl-1 text-center">Created on</p>
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
                                    {(parseInt(page, 10) - 1) *
                                        CLANS_RANKINGS_PER_PAGE +
                                        index +
                                        1}
                                </p>
                            )}
                            <p className="flex flex-1 items-center">
                                <AppLink href={`/stats/clan/${clan.id}`}>
                                    {cleanString(clan.name)}
                                </AppLink>
                            </p>
                            <div className="w-40 flex items-center justify-center">
                                {!!clan.created && clan.created > 0
                                    ? formatUnixTime(clan.created)
                                    : "N/A"}
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
