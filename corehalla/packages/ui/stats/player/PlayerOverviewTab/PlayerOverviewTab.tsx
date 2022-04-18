import { GeneralStats } from "../../GeneralStats"
import { MiscStatGroup } from "../../MiscStatGroup"
import { PlayerOverviewClanContent } from "./ClanContent"
import { PlayerOverviewRankedContent } from "./RankedContent"
import { SectionTitle } from "../../../layout/SectionTitle"
import { formatTime } from "common/helpers/date"
import type { FullLegend } from "bhapi/legends"
import type { MiscStat } from "../../MiscStatGroup"
import type { PlayerRanked, PlayerStats } from "bhapi/types"

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
    const { unarmed, gadgets, throws } = legends.reduce(
        (acc, legend) => ({
            unarmed: {
                kos: acc.unarmed.kos + (legend.stats?.kounarmed ?? 0),
                damageDealt:
                    acc.unarmed.damageDealt +
                    parseInt(legend.stats?.damageunarmed ?? "0"),
                matchtime:
                    acc.unarmed.matchtime +
                    (legend.stats
                        ? legend.stats.matchtime -
                          legend.stats.timeheldweaponone -
                          legend.stats.timeheldweapontwo
                        : 0),
            },
            gadgets: {
                kos: acc.gadgets.kos + (legend.stats?.kogadgets ?? 0),
                damageDealt:
                    acc.gadgets.damageDealt +
                    parseInt(legend.stats?.damagegadgets ?? "0"),
            },
            throws: {
                kos: acc.throws.kos + (legend.stats?.kothrownitem ?? 0),
                damageDealt:
                    acc.throws.damageDealt +
                    parseInt(legend.stats?.damagethrownitem ?? "0"),
            },
        }),
        {
            unarmed: {
                kos: 0,
                damageDealt: 0,
                matchtime: 0,
            },
            gadgets: {
                kos: 0,
                damageDealt: 0,
            },
            throws: {
                kos: 0,
                damageDealt: 0,
            },
        },
    )

    const generalStats: MiscStat[] = [
        {
            name: "Time unarmed",
            value: `${formatTime(unarmed.matchtime)}`,
        },
        {
            name: "Time unarmed %",
            value: `${((unarmed.matchtime / matchtime) * 100).toFixed(2)}%`,
        },
        {
            name: "KOs",
            value: unarmed.kos,
        },
        {
            name: "Avg. Kos per game",
            value: (unarmed.kos / stats.games).toFixed(2),
        },
        {
            name: "Damage Dealt",
            value: unarmed.damageDealt,
        },
        {
            name: "DPS",
            value: `${(unarmed.damageDealt / unarmed.matchtime).toFixed(
                2,
            )} dmg/s`,
        },
        {
            name: "Avg. dmg dealt per game",
            value: (unarmed.damageDealt / stats.games).toFixed(2),
        },
    ]

    const gadgetsStats: MiscStat[] = [
        {
            name: "KOs",
            value: gadgets.kos,
        },
        {
            name: "1 Ko every",
            value: `${(stats.games / gadgets.kos).toFixed(1)} games`,
        },
        {
            name: "Damage Dealt",
            value: gadgets.damageDealt,
        },
        {
            name: "Avg. dmg dealt per game",
            value: (gadgets.damageDealt / stats.games).toFixed(2),
        },
    ]

    const throwsStats: MiscStat[] = [
        {
            name: "KOs",
            value: throws.kos,
        },
        {
            name: "1 Ko every",
            value: `${(stats.games / throws.kos).toFixed(1)} games`,
        },
        {
            name: "Damage Dealt",
            value: throws.damageDealt,
        },
        {
            name: "Avg. dmg dealt per game",
            value: (throws.damageDealt / stats.games).toFixed(2),
        },
    ]

    return (
        <>
            {ranked && <PlayerOverviewRankedContent ranked={ranked} />}
            {clan && <PlayerOverviewClanContent clan={clan} />}
            <SectionTitle hasBorder>General Stats</SectionTitle>
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
            <SectionTitle hasBorder>Unarmed</SectionTitle>
            <MiscStatGroup className="mt-8" stats={generalStats} />
            <SectionTitle hasBorder>Weapon Throws</SectionTitle>
            <MiscStatGroup className="mt-8" stats={throwsStats} />
            <SectionTitle hasBorder>Gadgets</SectionTitle>
            <MiscStatGroup className="mt-8" stats={gadgetsStats} />
        </>
    )
}
