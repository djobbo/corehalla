"use client"

import { Image } from "@/components/Image"
import { MAX_SHOWN_ALIASES } from "@/util/constants"
import { type MiscStat } from "@/components/stats/MiscStatGroup"
import { StatsHeader } from "@/components/stats/StatsHeader"
import { cleanString } from "common/helpers/cleanString"
import { formatTime } from "common/helpers/date"
import { usePlayerStats } from "./PlayerStatsProvider"

export const PlayerStatsHeader = () => {
    const {
        stats,
        ranked,
        aliases,
        legends,
        legendsAccumulativeData: { matchtime },
        weapons,
    } = usePlayerStats()

    const legendsSortedByLevel = legends
        .slice(0)
        .sort((a, b) => (b.stats?.matchtime ?? 0) - (a.stats?.matchtime ?? 0))

    const accountStats: MiscStat[] = [
        {
            name: "Account level",
            value: stats.level,
            desc: `${stats.name}'s account level`,
        },
        {
            name: "Account XP",
            value: stats.xp,
            desc: `${stats.name}'s account XP`,
        },
        {
            name: "Game time",
            value: formatTime(matchtime),
            desc: `Time ${stats.name} spent in game`,
        },
        {
            name: "Main legends",
            value: (
                <div className="flex gap-1">
                    {legendsSortedByLevel.slice(0, 3).map((legend) => (
                        <Image
                            key={legend.legend_id}
                            src={`/images/icons/roster/legends/${legend.legend_name_key}.png`}
                            alt={legend.bio_name}
                            containerClassName="w-8 h-8 overflow-hidden rounded-sm"
                            className="object-contain object-center"
                        />
                    ))}
                </div>
            ),
            desc: `${stats.name}'s main legends`,
        },
        {
            name: "Main weapons",
            value: (
                <div className="flex gap-1">
                    {weapons
                        .map(({ weapon, legends }) => ({
                            weapon,
                            matchtime: legends.reduce((acc, legend) => {
                                const matchtime =
                                    weapon === legend.weapon_one
                                        ? legend.stats?.timeheldweaponone
                                        : legend.stats?.timeheldweapontwo
                                return acc + (matchtime ?? 0)
                            }, 0),
                        }))
                        .sort((a, b) => b.matchtime - a.matchtime)
                        .slice(0, 3)
                        .map((weapon) => (
                            <Image
                                key={weapon.weapon}
                                src={`/images/icons/weapons/${weapon.weapon}.png`}
                                alt={weapon.weapon}
                                containerClassName="w-8 h-8"
                                className="object-contain object-center"
                            />
                        ))}
                </div>
            ),
            desc: `${stats.name}'s main weapons`,
        },
    ]

    return (
        <StatsHeader
            name={cleanString(stats.name)}
            id={stats.brawlhalla_id}
            aliases={aliases
                .filter((alias) => alias.public)
                .map((alias) => alias.alias)
                .slice(0, MAX_SHOWN_ALIASES)}
            miscStats={accountStats}
            icon={
                ranked?.region && (
                    <Image
                        src={`/images/icons/flags/${ranked.region}.png`}
                        alt="Region Flag"
                        containerClassName="mt-2 w-6 h-6 rounded overflow-hidden mr-2"
                        className="object-contain object-center"
                    />
                )
            }
            favorite={{
                type: "player",
                id: stats.brawlhalla_id.toString(),
                name: cleanString(stats.name),
                meta: {
                    icon: {
                        type: "legend",
                        legend_id: legendsSortedByLevel[0].legend_id,
                    },
                },
            }}
        />
    )
}
