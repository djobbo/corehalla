import { ClanMember } from "@corehalla/core/src/components/stats/clan/ClanMember"
import { SEO } from "@corehalla/core/src/components/SEO"
import { StatsHeader } from "@corehalla/core/src/components/stats/StatsHeader"
import { cleanString } from "common/helpers/cleanString"
import { formatUnixTime } from "common/helpers/date"
import { useClan } from "@corehalla/core/src/hooks/stats/useClan"
import { useRouter } from "next/router"
import type { ClanRank } from "bhapi/constants"
import type { MiscStat } from "@corehalla/core/src/components/stats/MiscStatGroup"
import type { NextPage } from "next"

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
