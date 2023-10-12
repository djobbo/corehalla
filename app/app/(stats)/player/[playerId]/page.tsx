"use client"

import { ClanContent } from "./_overview/ClanContent"
import { CollapsibleSection } from "@/components/layout/CollapsibleSection"
import {
    GadgetsIcon,
    GeneralStatsIcon,
    UnarmedIcon,
    WeaponThrowsIcon,
} from "ui/icons"
import { GeneralStats } from "@/components/stats/GeneralStats"
import { type MiscStat, MiscStatGroup } from "@/components/stats/MiscStatGroup"
import { RankedContent } from "./_overview/RankedContent"
import { formatTime } from "common/helpers/date"
import { usePlayerStats } from "./PlayerStatsProvider"

export default function PlayerStatsPage() {
    const {
        stats,
        ranked,
        legendsAccumulativeData: {
            matchtime,
            kos,
            falls,
            suicides,
            teamkos,
            damageDealt,
            damageTaken,
        },
        weaponLessData: { unarmed, gadgets, throws },
    } = usePlayerStats()
    const { clan } = stats

    const generalStats: MiscStat[] = [
        {
            name: "Time unarmed",
            value: `${formatTime(unarmed.matchtime)}`,
            desc: `Time played unarmed`,
        },
        {
            name: "Time unarmed (%)",
            value: `${((unarmed.matchtime / matchtime) * 100).toFixed(2)}%`,
            desc: `Time played unarmed (percentage of total time)`,
        },
        {
            name: "KOs",
            value: unarmed.kos,
            desc: `Unarmed KOs`,
        },
        {
            name: "Avg. Kos per game",
            value: (unarmed.kos / stats.games).toFixed(2),
            desc: `Average unarmed KOs per game`,
        },
        {
            name: "Damage Dealt",
            value: unarmed.damageDealt,
            desc: `Damage dealt unarmed`,
        },
        {
            name: "DPS",
            value: `${(unarmed.damageDealt / unarmed.matchtime).toFixed(
                2,
            )} dmg/s`,
            desc: `Damage dealt unarmed per second`,
        },
        {
            name: "Avg. dmg dealt per game",
            value: (unarmed.damageDealt / stats.games).toFixed(2),
            desc: `Average damage dealt unarmed per game`,
        },
    ]

    const gadgetsStats: MiscStat[] = [
        {
            name: "KOs",
            value: gadgets.kos,
            desc: `Gadgets KOs`,
        },
        {
            name: "1 Ko every",
            value: `${(stats.games / gadgets.kos).toFixed(1)} games`,
            desc: `Average games between each gadget KO`,
        },
        {
            name: "Damage Dealt",
            value: gadgets.damageDealt,
            desc: `Damage dealt with gadgets`,
        },
        {
            name: "Avg. dmg dealt per game",
            value: (gadgets.damageDealt / stats.games).toFixed(2),
            desc: `Average damage dealt with gadgets per game`,
        },
    ]

    const throwsStats: MiscStat[] = [
        {
            name: "KOs",
            value: throws.kos,
            desc: "KOs with thrown items",
        },
        {
            name: "1 Ko every",
            value: `${(stats.games / throws.kos).toFixed(1)} games`,
            desc: `Average games between each thrown item KO`,
        },
        {
            name: "Damage Dealt",
            value: throws.damageDealt,
            desc: "Damage dealt with thrown items",
        },
        {
            name: "Avg. dmg dealt per game",
            value: (throws.damageDealt / stats.games).toFixed(2),
            desc: `Damage dealt with thrown items per game`,
        },
    ]

    return (
        <>
            {ranked && <RankedContent />}
            {clan && <ClanContent />}
            <CollapsibleSection
                trigger={
                    <>
                        <GeneralStatsIcon
                            size={20}
                            className="fill-accentVar1"
                        />
                        General Stats
                    </>
                }
            >
                <GeneralStats
                    className="mt-2"
                    games={stats.games}
                    wins={stats.wins}
                    kos={kos}
                    falls={falls}
                    suicides={suicides}
                    teamkos={teamkos}
                    damageDealt={damageDealt}
                    damageTaken={damageTaken}
                    matchtime={matchtime}
                />
            </CollapsibleSection>
            <CollapsibleSection
                trigger={
                    <>
                        <UnarmedIcon size={20} className="fill-accentVar1" />
                        Unarmed
                    </>
                }
            >
                <MiscStatGroup className="mt-8" stats={generalStats} />
            </CollapsibleSection>
            <CollapsibleSection
                trigger={
                    <>
                        <WeaponThrowsIcon
                            size={20}
                            className="stroke-accentVar1"
                        />
                        Weapon Throws
                    </>
                }
            >
                <MiscStatGroup className="mt-8" stats={throwsStats} />
            </CollapsibleSection>
            <CollapsibleSection
                trigger={
                    <>
                        <GadgetsIcon size={20} className="fill-accentVar1" />
                        Gadgets
                    </>
                }
            >
                <MiscStatGroup className="mt-8" stats={gadgetsStats} />
            </CollapsibleSection>
        </>
    )
}
