import { ClanMember } from "@components/stats/clan/ClanMember"
import { QueryClient, dehydrate } from "react-query"
import { SEO } from "@components/SEO"
import { StatsHeader } from "@components/stats/StatsHeader"
import { cleanString } from "common/helpers/cleanString"
import { formatUnixTime } from "common/helpers/date"
import { getClan } from "bhapi"
import { supabaseService } from "db/supabase/service"
import { useClan } from "../../../hooks/useClan"
import { useRouter } from "next/router"
import type { BHClan } from "db/generated/client"
import type { GetServerSideProps, NextPage } from "next"
import type { MiscStat } from "@components/stats/MiscStatGroup"

const Page: NextPage = () => {
    const router = useRouter()
    const { clanId } = router.query

    const { clan, isLoading, isError } = useClan(clanId as string)

    if (isLoading) return <p>Loading...</p>

    if (isError || !clan) return <p>Error</p>

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
                {clan.clan.map((member) => (
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
    const queryClient = new QueryClient()

    // TODO: Error handling
    const clan = await getClan(clanId)

    await Promise.all([
        queryClient.prefetchQuery(["clanStats", clanId], async () => clan),
        supabaseService.from<BHClan>("BHClan").upsert({
            id: clan.clan_id.toString(),
            name: clan.clan_name,
            created: clan.clan_create_date,
            xp: clan.clan_xp,
        }),
    ])

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
        },
    }
}
