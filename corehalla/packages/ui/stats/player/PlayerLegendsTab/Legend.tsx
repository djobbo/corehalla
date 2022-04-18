import { CollapsibleSection } from "ui/layout/CollapsibleSection"
import { GeneralStats } from "ui/stats/GeneralStats"
import { MiscStatGroup } from "ui/stats/MiscStatGroup"
import { border } from "ui/theme"
import { cn } from "common/helpers/classnames"
import { formatTime } from "common/helpers/date"
import Image from "next/image"
import type { FullLegend } from "bhapi/legends"
import type { MiscStat } from "ui/stats/MiscStatGroup"

type LegendProps = {
    legend: FullLegend
    matchtime: number
    games: number
}

export const Legend = ({ legend, matchtime, games }: LegendProps) => {
    const legendStats: MiscStat[] = [
        {
            name: "level",
            value: legend.stats?.level ?? 0,
        },
        {
            name: "xp",
            value: legend.stats?.xp ?? 0,
        },
        {
            name: "Time played",
            value: `${formatTime(legend.stats?.matchtime ?? 0)}`,
        },
        {
            name: "Time played %",
            value: `${(
                ((legend.stats?.matchtime ?? 0) / matchtime) *
                100
            ).toFixed(2)}%`,
        },
        {
            name: "Usage rate (games)",
            value: `${(((legend.stats?.games ?? 0) / games) * 100).toFixed(
                2,
            )}%`,
        },
    ]

    return (
        <CollapsibleSection
            key={legend.legend_id}
            className={cn("shadow-md p-4 border rounded", border("blue4"))}
            triggerClassName="w-full flex justify-start items-center gap-2"
            contentClassName="pt-4"
            trigger={
                <>
                    <span className="relative w-6 h-6">
                        <Image
                            src={`/images/icons/roster/legends/${legend.bio_name}.png`}
                            alt={legend.bio_name}
                            layout="fill"
                            objectFit="contain"
                            objectPosition="center"
                        />
                    </span>
                    {legend.bio_name}
                </>
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
        </CollapsibleSection>
    )
}
