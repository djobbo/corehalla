"use client"

import { type MiscStat } from "@/components/stats/MiscStatGroup"
import { StatsHeader } from "@/components/stats/StatsHeader"
import { cleanString } from "common/helpers/cleanString"
import { formatUnixTime } from "common/helpers/date"
import { useClanStats } from "./ClanStatsProvider"

export const ClanStatsHeader = () => {
    const { clan } = useClanStats()

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
    )
}
