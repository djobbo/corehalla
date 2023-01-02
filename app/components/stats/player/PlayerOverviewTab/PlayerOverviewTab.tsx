import { CollapsibleSection } from "@components/layout/CollapsibleSection"
import { FiTarget } from "react-icons/fi"
import { GeneralStats } from "../../GeneralStats"
import { HiChartBar, HiFire, HiHand } from "react-icons/hi"
import { MiscStatGroup } from "../../MiscStatGroup"
import { PlayerOverviewClanContent } from "./ClanContent"
import { PlayerOverviewRankedContent } from "./RankedContent"
import { formatTime } from "@ch/common/helpers/date"
import { getWeaponlessData } from "@ch/bhapi/legends"
import type { FullLegend } from "@ch/bhapi/legends"
import type { MiscStat } from "../../MiscStatGroup"
import type { PlayerRanked, PlayerStats } from "@ch/bhapi/types"

type PlayerOverviewTabProps = {
    stats: PlayerStats
    ranked?: PlayerRanked
    legends: FullLegend[]
    kos: number
    falls: number
    suicides: number
    teamkos: number
    damageDealt: number
    damageTaken: number
    matchtime: number
}

export const PlayerOverviewTab = ({
    stats,
    ranked,
    legends,
    kos,
    falls,
    suicides,
    teamkos,
    damageDealt,
    damageTaken,
    matchtime,
}: PlayerOverviewTabProps) => {
    const { clan } = stats
    const { unarmed, gadgets, throws } = getWeaponlessData(legends)

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
            {ranked && <PlayerOverviewRankedContent ranked={ranked} />}
            {clan && <PlayerOverviewClanContent playerStats={stats} />}
            <CollapsibleSection
                trigger={
                    <>
                        <HiChartBar size={20} className="fill-accentVar1" />
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
                        <HiHand size={20} className="fill-accentVar1" />
                        Unarmed
                    </>
                }
            >
                <MiscStatGroup className="mt-8" stats={generalStats} />
            </CollapsibleSection>
            <CollapsibleSection
                trigger={
                    <>
                        <FiTarget size={20} className="stroke-accentVar1" />
                        Weapon Throws
                    </>
                }
            >
                <MiscStatGroup className="mt-8" stats={throwsStats} />
            </CollapsibleSection>
            <CollapsibleSection
                trigger={
                    <>
                        <HiFire size={20} className="fill-accentVar1" />
                        Gadgets
                    </>
                }
            >
                <MiscStatGroup className="mt-8" stats={gadgetsStats} />
            </CollapsibleSection>
        </>
    )
}
