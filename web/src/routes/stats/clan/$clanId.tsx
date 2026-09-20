import { ClanMember } from "@components/stats/clan/ClanMember"
import { StatsHeader } from "@components/stats/StatsHeader"
import { cleanString } from "common/helpers/cleanString"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { formatUnixTime } from "common/helpers/date"
import { getClanStats } from "@/server/api.functions"
import { numericStringSchema } from "@/server/schemas"
import { seoTags } from "@components/SEO"
import type { ClanRank } from "bhapi/constants"
import type { MiscStat } from "@components/stats/MiscStatGroup"

const clanRankWeights: Record<ClanRank, number> = {
    Leader: 0,
    Officer: 1,
    Member: 2,
    Recruit: 3,
} as const

export const Route = createFileRoute("/stats/clan/$clanId")({
    loader: async ({ params }) => {
        if (!numericStringSchema.safeParse(params.clanId).success) {
            throw notFound()
        }

        const clan = await getClanStats({ data: { clanId: params.clanId } })

        if (!clan) {
            throw notFound()
        }

        return clan
    },
    head: ({ loaderData }) => {
        const name = loaderData?.clan_name
        return {
            meta: seoTags({
                title: name
                    ? `${name} - Clan Stats • Corehalla`
                    : "Clan Stats • Corehalla",
                description: name
                    ? `${name} Stats - Brawlhalla Clan Stats • Corehalla`
                    : undefined,
            }),
        }
    },
    component: Page,
})

function Page() {
    const clan = Route.useLoaderData()

    const clanStats: MiscStat[] = [
        {
            name: "Created on",
            value: formatUnixTime(clan.clan_create_date),
            desc: `Date when ${cleanString(clan.clan_name)} was created`,
        },
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

    const sortedMembers = clan.clan.slice(0).sort((a, b) => {
        if (a.rank === b.rank) {
            return a.join_date - b.join_date
        }

        return clanRankWeights[a.rank] - clanRankWeights[b.rank]
    })

    return (
        <>
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
