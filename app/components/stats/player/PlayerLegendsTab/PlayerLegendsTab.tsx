import { Legend } from "./Legend"
import { MiscStatGroup } from "../../MiscStatGroup"
import { Select } from "ui/base/Select"
import { SortAscendingIcon, SortDescendingIcon } from "ui/icons"
import { SortDirection, useSortBy } from "common/hooks/useSortBy"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import { formatTime } from "common/helpers/date"
import { useMemo, useState } from "react"
import { weapons } from "bhapi/constants"
import type { FullLegend } from "bhapi/legends"
import type { MiscStat } from "../../MiscStatGroup"
import type { Weapon } from "bhapi/constants"

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
    | "matchtime"

export const PlayerLegendsTab = ({
    legends,
    matchtime,
    games,
}: PlayerLegendsTabProps) => {
    const [weaponFilter, setWeaponFilter] = useState<Weapon | "">("")
    const {
        sortedArray: sortedLegends,
        sortBy: legendSortBy,
        setSortBy: sortLegendBy,
        options: legendSortOptions,
        changeSortDirection: changeLegendSortDirection,
        sortDirection: legendSortDirection,
        displaySortFn: displayLegendSortFn,
    } = useSortBy<FullLegend, LegendSortOption>(
        legends,
        {
            name: {
                label: "Name",
                sortFn: (a, b) => b.bio_name.localeCompare(a.bio_name),
            },
            xp: {
                label: "Level / XP",
                sortFn: (a, b) => (a.stats?.xp ?? 0) - (b.stats?.xp ?? 0),
                displayFn: (legend) => (
                    <>
                        Level {legend.stats?.level ?? 0} (
                        {legend.stats?.xp ?? 0} xp)
                    </>
                ),
            },
            matchtime: {
                label: "Matchtime",
                sortFn: (a, b) =>
                    (a.stats?.matchtime ?? 0) - (b.stats?.matchtime ?? 0),
                displayFn: (legend) => (
                    <>{formatTime(legend.stats?.matchtime ?? 0)}</>
                ),
            },
            games: {
                label: "Games",
                sortFn: (a, b) => (a.stats?.games ?? 0) - (b.stats?.games ?? 0),
                displayFn: (legend) => <>{legend.stats?.games ?? 0} games</>,
            },
            wins: {
                label: "Wins",
                sortFn: (a, b) => (a.stats?.wins ?? 0) - (b.stats?.wins ?? 0),
                displayFn: (legend) => <>{legend.stats?.wins ?? 0} wins</>,
            },
            losses: {
                label: "Losses",
                sortFn: (a, b) =>
                    (a.stats?.games ?? 0) -
                    (a.stats?.wins ?? 0) -
                    ((b.stats?.games ?? 0) - (b.stats?.wins ?? 0)),
                displayFn: (legend) => (
                    <>
                        {(legend.stats?.games ?? 0) - (legend.stats?.wins ?? 0)}{" "}
                        losses
                    </>
                ),
            },
            winrate: {
                label: "Winrate",
                sortFn: (a, b) =>
                    calculateWinrate(a.stats?.wins ?? 0, a.stats?.games ?? 0) -
                    calculateWinrate(b.stats?.wins ?? 0, b.stats?.games ?? 0),
                displayFn: (legend) => (
                    <>
                        {calculateWinrate(
                            legend.stats?.wins ?? 0,
                            legend.stats?.games ?? 0,
                        ).toFixed(2)}
                        % winrate
                    </>
                ),
            },
            rating: {
                label: "Elo",
                sortFn: (a, b) =>
                    (a.ranked?.rating ?? 0) - (b.ranked?.rating ?? 0),
                displayFn: (legend) => <>{legend.ranked?.rating ?? 0} elo</>,
            },
            peak_rating: {
                label: "Peak elo",
                sortFn: (a, b) =>
                    (a.ranked?.peak_rating ?? 0) - (b.ranked?.peak_rating ?? 0),
                displayFn: (legend) => (
                    <>{legend.ranked?.peak_rating ?? 0} peak elo</>
                ),
            },
        },
        "xp",
        SortDirection.Descending,
    )

    const filteredLegends = useMemo(
        () =>
            sortedLegends.filter(
                (legend) =>
                    !weaponFilter ||
                    [legend.weapon_one, legend.weapon_two].includes(
                        weaponFilter,
                    ),
            ),
        [sortedLegends, weaponFilter],
    )

    const globalLegendsStats: MiscStat[] = [
        {
            name: "Legends played",
            value: (
                <>
                    {
                        filteredLegends.filter(
                            (legend) =>
                                legend.stats && legend.stats.matchtime > 0,
                        ).length
                    }{" "}
                    / {filteredLegends.length}
                </>
            ),
            desc: "Legends that were played at least once",
        },
        {
            name: "Played in ranked",
            value: (
                <>
                    {filteredLegends.filter(
                        (legend) => legend.ranked && legend.ranked.games > 0,
                    ).length ?? 0}{" "}
                    / {filteredLegends.length}
                </>
            ),
            desc: "Legends that were played at least once in ranked 1v1 during this season",
        },
        {
            name: "Total legends level",
            value: filteredLegends.reduce(
                (level, legend) => level + (legend.stats?.level ?? 0),
                0,
            ),
            desc: "Sum of of all legends",
        },
        {
            name: "Avg. level",
            value: (
                filteredLegends.reduce(
                    (level, legend) => level + (legend.stats?.level ?? 0),
                    0,
                ) / filteredLegends.length
            ).toFixed(0),
            desc: "Average level of all legends",
        },
    ]

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-8 items-center w-full">
                <Select<Weapon | "">
                    className="flex-1 w-full"
                    onChange={setWeaponFilter}
                    value={weaponFilter}
                    options={[
                        {
                            label: "All Weapons",
                            value: "",
                        },
                        ...weapons.map((weapon) => ({
                            label: weapon,
                            value: weapon,
                        })),
                    ]}
                    label="Filter by weapon"
                />
                <div className="flex-1 flex gap-4 items-center w-full">
                    <Select<LegendSortOption>
                        className="flex-1"
                        onChange={sortLegendBy}
                        value={legendSortBy}
                        options={legendSortOptions}
                        label="Sort by"
                    />
                    <button
                        type="button"
                        onClick={changeLegendSortDirection}
                        className="flex items-center hover:text-accent"
                    >
                        {legendSortDirection === SortDirection.Ascending ? (
                            <SortAscendingIcon className="w-6 h-6" />
                        ) : (
                            <SortDescendingIcon className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>
            <MiscStatGroup className="mt-8" stats={globalLegendsStats} />
            <div className="flex flex-col gap-2 mt-8">
                {filteredLegends.map((legend, i) => (
                    <Legend
                        key={legend.legend_id}
                        legend={legend}
                        matchtime={matchtime}
                        games={games}
                        displayedInfoFn={displayLegendSortFn}
                        rank={
                            legendSortDirection === SortDirection.Ascending
                                ? filteredLegends.length - i
                                : i + 1
                        }
                    />
                ))}
            </div>
        </>
    )
}
