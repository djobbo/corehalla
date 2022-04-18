import { ClanMember } from "ui/stats/clan/ClanMember"
import { QueryClient, dehydrate } from "react-query"
import { StatsHeader } from "ui/stats/StatsHeader"
import { formatUnixTime } from "common/helpers/date"
import { getClan } from "bhapi"
import { useClan } from "bhapi/hooks/useClan"
import { useRouter } from "next/router"
import type { GetServerSideProps, NextPage } from "next"
import type { MiscStat } from "ui/stats/MiscStatGroup"

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
        },
        // {
        //     name: "Level",
        //     value: "TBA",
        // },
        {
            name: "XP",
            value: clan.clan_xp,
        },
        {
            name: "Members",
            value: clan.clan.length,
        },
    ]

    return (
        <>
            <StatsHeader
                name={clan.clan_name}
                id={clan.clan_id}
                miscStats={clanStats}
                favorite={{
                    type: "clan",
                    id: clan.clan_id,
                    name: clan.clan_name,
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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const { clanId } = query
    if (!clanId || typeof clanId !== "string") return { notFound: true }
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery(["clanStats", clanId], () =>
        getClan(clanId),
    )

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
        },
    }
}