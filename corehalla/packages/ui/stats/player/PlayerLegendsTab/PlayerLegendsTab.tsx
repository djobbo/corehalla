import { Legend } from "./Legend"
import { MiscStatGroup } from "ui/stats/MiscStatGroup"
import type { FullLegend } from "bhapi/legends"
import type { MiscStat } from "ui/stats/MiscStatGroup"

type PlayerLegendsTabProps = {
    legends: FullLegend[]
    matchtime: number
    games: number
}

export const PlayerLegendsTab = ({
    legends,
    matchtime,
    games,
}: PlayerLegendsTabProps) => {
    const globalLegendsStats: MiscStat[] = [
        {
            name: "Legends played",
            value: (
                <>
                    {
                        legends.filter(
                            (legend) =>
                                legend.stats && legend.stats.matchtime > 0,
                        ).length
                    }{" "}
                    / {legends.length}
                </>
            ),
        },
        {
            name: "Played in ranked",
            value: (
                <>
                    {legends.filter(
                        (legend) => legend.ranked && legend.ranked.games > 0,
                    ).length ?? 0}{" "}
                    / {legends.length}
                </>
            ),
        },
        {
            name: "Total legends level",
            value: legends.reduce(
                (level, legend) => level + (legend.stats?.level ?? 0),
                0,
            ),
        },
        {
            name: "Avg. level",
            value: (
                legends.reduce(
                    (level, legend) => level + (legend.stats?.level ?? 0),
                    0,
                ) / legends.length
            ).toFixed(0),
        },
    ]

    return (
        <>
            <MiscStatGroup className="mt-8" stats={globalLegendsStats} />
            <div className="flex flex-col gap-2 mt-8">
                {legends
                    .slice(0)
                    .sort(
                        (a, b) =>
                            (b.stats?.matchtime ?? 0) -
                            (a.stats?.matchtime ?? 0),
                    )
                    .map((legend) => (
                        <Legend
                            key={legend.legend_id}
                            legend={legend}
                            matchtime={matchtime}
                            games={games}
                        />
                    ))}
            </div>
        </>
    )
}
