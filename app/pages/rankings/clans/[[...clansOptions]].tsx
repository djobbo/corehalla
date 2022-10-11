import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { SEO } from "@components/SEO"
import { useRouter } from "next/router"
import type { NextPage } from "next"

const ClansPage: NextPage = () => {
    const router = useRouter()

    const { clansOptions } = router.query

    const [page = "1"] = Array.isArray(clansOptions) ? clansOptions : []

    // const { clans, isLoading, isError } = useClansRankings(
    //     page,
    //     name.toString(),
    // )

    // if (isError || (!isLoading && !clans)) return <div>Error</div>

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
            regions={[]}
            currentPage={page}
            // hasPagination
        >
            <SEO
                title={`Brawlhalla Clans - Page ${page} • Corehalla`}
                description={`Brawhalla Clans - Page ${page} • Corehalla`}
            />
            Clan search will be implemented soon.
            {/* <div className="py-4 w-full h-full flex items-center gap-4">
                <p className="w-16 text-center">Rank</p>
                <p className="w-16 text-center">Region</p>
                <p className="flex-1">Name</p>
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
                <div className="rounded-lg overflow-hidden border border-bg mb-4">
                    {clans.map((clan, index) => (
                        <div
                            key={clan.clan_id}
                            className={cn(
                                "py-1 w-full h-full flex items-center gap-4 hover:bg-bg",
                                { "bg-bgVar2": index % 2 === 0 },
                            )}
                        >
                            <p className="flex flex-1 items-center">
                                <AppLink href={`/stats/clans/${clan.clan_id}`}>
                                    {cleanString(clan.clan_name)}
                                </AppLink>
                            </p>
                            <p className="w-20 text-center">{clan.clan_xp}</p>
                            <div className="w-40 flex items-center justify-start">
                                {clan.clan_create_date}
                            </div>
                        </div>
                    ))}
                </div>
            )} */}
        </RankingsLayout>
    )
}

export default ClansPage
