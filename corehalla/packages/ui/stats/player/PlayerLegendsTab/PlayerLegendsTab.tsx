import { Button } from "../../../base/Button"
import { Legend } from "./Legend"
import { MiscStatGroup } from "../../MiscStatGroup"
import { SortDirection, useSortBy } from "common/hooks/useSortBy"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import type { FullLegend } from "bhapi/legends"
import type { MiscStat } from "../../MiscStatGroup"

type PlayerLegendsTabProps = {
    legends: FullLegend[]
    matchtime: number
    games: number
}

type LegendSortOption =
    | "name"
    | "xp"
    | "games"
    | "wins"
    | "losses"
    | "winrate"
    | "rating"
    | "peak_rating"

export const PlayerLegendsTab = ({
    legends,
    matchtime,
    games,
}: PlayerLegendsTabProps) => {
    const {
        sortedArray: sortedLegends,
        sortBy: legendSortBy,
        setSortBy: sortLegendBy,
        options: legendSortOptions,
        changeSortDirection: changeLegendSortDirection,
        sortDirection: legendSortDirection,
    } = useSortBy<FullLegend, LegendSortOption>(
        legends,
        {
            name: {
                name: "Name",
                fn: (a, b) => a.bio_name.localeCompare(b.bio_name),
            },
            xp: {
                name: "Level / XP",
                fn: (a, b) => (a.stats?.xp ?? 0) - (b.stats?.xp ?? 0),
            },
            games: {
                name: "Games",
                fn: (a, b) => (a.stats?.games ?? 0) - (b.stats?.games ?? 0),
            },
            wins: {
                name: "Wins",
                fn: (a, b) => (a.stats?.wins ?? 0) - (b.stats?.wins ?? 0),
            },
            losses: {
                name: "Losses",
                fn: (a, b) =>
                    (a.stats?.games ?? 0) -
                    (a.stats?.wins ?? 0) -
                    ((b.stats?.games ?? 0) - (b.stats?.wins ?? 0)),
            },
            winrate: {
                name: "Winrate",
                fn: (a, b) =>
                    calculateWinrate(a.stats?.wins ?? 0, a.stats?.games ?? 0) -
                    calculateWinrate(b.stats?.wins ?? 0, b.stats?.games ?? 0),
            },
            rating: {
                name: "Elo",
                fn: (a, b) => (a.ranked?.rating ?? 0) - (b.ranked?.rating ?? 0),
            },
            peak_rating: {
                name: "Peak elo",
                fn: (a, b) =>
                    (a.ranked?.peak_rating ?? 0) - (b.ranked?.peak_rating ?? 0),
            },
        },
        "xp",
        SortDirection.Descending,
    )
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
            {/* TODO: Typesafe select */}
            <select
                onChange={(e) => {
                    sortLegendBy(e.target.value as LegendSortOption)
                }}
                value={legendSortBy}
            >
                {legendSortOptions.map(({ key, name }) => (
                    <option key={key} value={key}>
                        {name}
                    </option>
                ))}
            </select>
            <Button onClick={changeLegendSortDirection}>
                {legendSortDirection === SortDirection.Ascending
                    ? "asc"
                    : "dsc"}
            </Button>
            <div className="flex flex-col gap-2 mt-8">
                {sortedLegends.map((legend) => (
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
