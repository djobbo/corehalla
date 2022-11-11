import { ClanMember } from "@components/stats/clan/ClanMember"
import { SEO } from "@components/SEO"
import { StatsHeader } from "@components/stats/StatsHeader"
import { cleanString } from "common/helpers/cleanString"
import { dehydrate } from "react-query"
import { formatUnixTime } from "common/helpers/date"
import { getClan } from "bhapi"
import { queryClient } from "@util/queryClient"
import { supabaseService } from "db/supabase/service"
import { useClan } from "@hooks/stats/useClan"
import { useRouter } from "next/router"
import type { BHClan, BHPlayerAlias } from "db/generated/client"
import type { ClanRank } from "bhapi/constants"
import type { GetServerSideProps, NextPage } from "next"
import type { MiscStat } from "@components/stats/MiscStatGroup"

const clanRankWeights: Record<ClanRank, number> = {
    Leader: 0,
    Officer: 1,
    Member: 2,
    Recruit: 3,
} as const

const Page: NextPage = () => {
    const router = useRouter()
    const { clanId } = router.query

    const { clan, isLoading, isError } = useClan(clanId as string)

    if (isLoading) return <p>Loading...</p>

    if (isError || !clan) return <p>Error fetching clan stats</p>

    const clanStats: MiscStat[] = [
        {
            name: "Created on",
            value: formatUnixTime(clan.clan_create_date),
            desc: `Date when ${cleanString(clan.clan_name)} was created`,
        },
        // {
        //     name: "Level",
        //     value: "TBA",
        // },
        {
            name: "XP",
            value: clan.clan_xp,
            desc: `XP earned by ${cleanString(
                clan.clan_name,
            )} members since creation`,
        },
        {
            name: "Members",
            value: clan.clan.length,
            desc: `Number of members in ${cleanString(clan.clan_name)}`,
        },
    ]

    const sortedMembers = clan.clan.sort((a, b) => {
        if (a.rank === b.rank) {
            return a.join_date - b.join_date
        }

        return clanRankWeights[a.rank] - clanRankWeights[b.rank]
    })

    return (
        <>
            <SEO
                title={`${clan.clan_name} - Clan Stats • Corehalla`}
                description={`${clan.clan_name} Stats - Brawlhalla Clan Stats • Corehalla`}
            />
            <StatsHeader
                name={cleanString(clan.clan_name)}
                id={clan.clan_id}
                miscStats={clanStats}
                favorite={{
                    type: "clan",
                    id: clan.clan_id.toString(),
                    name: cleanString(clan.clan_name),
                    meta: {},
                }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {sortedMembers.map((member) => (
                    <ClanMember
                        key={member.brawlhalla_id}
                        member={member}
                        clan={clan}
                    />
                ))}
            </div>
        </>
    )
}

export default Page

export const getServerSideProps: GetServerSideProps = async ({
    query,
    res,
}) => {
    res.setHeader(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=480",
    )

    const { clanId } = query
    if (!clanId || typeof clanId !== "string") return { notFound: true }

    // TODO: Error handling
    const clan = await getClan(clanId)

    if (!clan || !clan.clan_id) {
        return { notFound: true }
    }

    try {
        await Promise.all([
            queryClient.prefetchQuery(["clanStats", clanId], async () => clan),
            supabaseService.from<BHClan>("BHClan").upsert({
                id: clan.clan_id.toString(),
                name: clan.clan_name,
                created: clan.clan_create_date,
                xp: parseInt(clan.clan_xp),
            }),
            supabaseService.from<BHPlayerAlias>("BHPlayerAlias").upsert(
                clan.clan.map((member) => ({
                    playerId: member.brawlhalla_id.toString(),
                    alias: member.name,
                })),
            ),
        ])
    } catch {
        return { notFound: true }
    }

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
        },
    }
}
