import { ClanMember } from "@components/stats/clan/ClanMember"
import { StatsHeader } from "@components/stats/StatsHeader"
import { AdsenseProfileBottom } from "common/analytics/Adsense"
import { cleanString } from "common/helpers/cleanString"
import { clanStatsAtom, loadAtoms, preloadAtom, useQuery } from "@/effect/atoms"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { formatUnixTime } from "common/helpers/date"
import { numericStringSchema } from "@/lib/routeSchemas"
import { seoTags } from "@components/SEO"
import type { Clan } from "bhapi/types"
import type { ClanRank } from "bhapi/constants"
import type { MiscStat } from "@components/stats/MiscStatGroup"

const clanRankWeights: Record<ClanRank, number> = {
    Leader: 0,
    Officer: 1,
    Member: 2,
    Recruit: 3,
} as const

export const Route = createFileRoute("/stats/clan/$clanId")({
    async loader({ params, context }) {
        if (!numericStringSchema.safeParse(params.clanId).success) {
            throw notFound()
        }

        const clanId = parseInt(params.clanId)

        const clan = (await preloadAtom(
            context.registry,
            clanStatsAtom(clanId),
        )) as Clan | null

        if (!clan) {
            throw notFound()
        }

        const loaded = await loadAtoms(context, [])

        return { ...loaded, clanName: clan.clan_name }
    },
    head({ loaderData }) {
        const name = loaderData?.clanName
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
    const { clanId } = Route.useParams()
    const clan = useQuery(clanStatsAtom(parseInt(clanId)))

    if (!clan) return null

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
            <AdsenseProfileBottom className="mt-8" />
        </>
    )
}
