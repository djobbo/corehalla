"use client"

import { ClanMember } from "./ClanMember"
import { useClanStats } from "./ClanStatsProvider"
import type { ClanRank } from "bhapi/constants"

const clanRankWeights: Record<ClanRank, number> = {
    Leader: 0,
    Officer: 1,
    Member: 2,
    Recruit: 3,
} as const

export default function ClanStatsPage() {
    const { clan } = useClanStats()

    const sortedMembers = clan.clan.sort((a, b) => {
        if (a.rank === b.rank) {
            return a.join_date - b.join_date
        }

        return clanRankWeights[a.rank] - clanRankWeights[b.rank]
    })

    return (
        <>
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
