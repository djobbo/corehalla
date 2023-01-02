import { CollapsibleContent } from "../../../layout/CollapsibleContent"
import { GeneralStats } from "../../GeneralStats"
import { Image } from "@components/Image"
import { MiscStatGroup } from "../../MiscStatGroup"
import { PlayerLegendRankedContent } from "./RankedContent"
import { PlayerLegendWeaponDistribution } from "./WeaponDistribution"
import { formatTime } from "@ch/common/helpers/date"
import type { FullLegend } from "@ch/bhapi/legends"
import type { MiscStat } from "../../MiscStatGroup"

type LegendProps = {
    legend: FullLegend
    matchtime: number
    games: number
    displayedInfoFn?: (legend: FullLegend) => JSX.Element
    rank: number
}

export const Legend = ({
    legend,
    matchtime,
    games,
    displayedInfoFn,
    rank,
}: LegendProps) => {
    const legendStats: MiscStat[] = [
        {
            name: "level",
            value: legend.stats?.level ?? 0,
            desc: "Legend level",
        },
        {
            name: "xp",
            value: legend.stats?.xp ?? 0,
            desc: "XP earned with this legend",
        },
        {
            name: "Time played",
            value: `${formatTime(legend.stats?.matchtime ?? 0)}`,
            desc: "Time played with this legend",
        },
        {
            name: "Time played (%)",
            value: `${(
                ((legend.stats?.matchtime ?? 0) / matchtime) *
                100
            ).toFixed(2)}%`,
            desc: "Time played with this legend (percentage of total time)",
        },
        {
            name: "Usage rate (games)",
            value: `${(((legend.stats?.games ?? 0) / games) * 100).toFixed(
                2,
            )}%`,
            desc: "Usage rate of this legend (percentage of total games)",
        },
    ]

    return (
        <CollapsibleContent
            key={legend.legend_id}
            className="shadow-md border rounded-lg border-bg"
            triggerClassName="w-full p-4 flex justify-start items-center gap-2"
            contentClassName="px-4 pb-4"
            closingArrow
            trigger={
                <span className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                        <span className="text-sm text-textVar1">{rank}</span>
                        <Image
                            src={`/images/icons/roster/legends/${legend.legend_name_key}.png`}
                            alt={legend.bio_name}
                            Container="span"
                            containerClassName="block w-6 h-6 rounded-lg overflow-hidden"
                            className="object-contain object-center"
                        />
                        {legend.bio_name}
                    </span>
                    <span className="text-sm text-textVar1">
                        {displayedInfoFn?.(legend)}
                    </span>
                </span>
            }
        >
            <MiscStatGroup className="mt-2" stats={legendStats} />
            <GeneralStats
                className="mt-2"
                games={legend.stats?.games ?? 0}
                wins={legend.stats?.wins ?? 0}
                kos={legend.stats?.kos ?? 0}
                falls={legend.stats?.falls ?? 0}
                suicides={legend.stats?.suicides ?? 0}
                teamkos={legend.stats?.teamkos ?? 0}
                damageDealt={parseInt(legend.stats?.damagedealt ?? "0")}
                damageTaken={parseInt(legend.stats?.damagetaken ?? "0")}
                matchtime={legend.stats?.matchtime ?? 0}
            />
            <PlayerLegendRankedContent ranked={legend.ranked} />
            <PlayerLegendWeaponDistribution legend={legend} />
        </CollapsibleContent>
    )
}
