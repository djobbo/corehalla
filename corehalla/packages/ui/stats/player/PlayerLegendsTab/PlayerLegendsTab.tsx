import { Legend } from "./Legend"
import { MiscStatGroup } from "../../MiscStatGroup"
import { Select } from "../../../base/Select"
import { SortAscendingIcon, SortDescendingIcon } from "@heroicons/react/solid"
import { SortDirection, useSortBy } from "common/hooks/useSortBy"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
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
    } = useSortBy<FullLegend, LegendSortOption>(
        legends,
        {
            name: {
                label: "Name",
                fn: (a, b) => a.bio_name.localeCompare(b.bio_name),
            },
            xp: {
                label: "Level / XP",
                fn: (a, b) => (a.stats?.xp ?? 0) - (b.stats?.xp ?? 0),
            },
            games: {
                label: "Games",
                fn: (a, b) => (a.stats?.games ?? 0) - (b.stats?.games ?? 0),
            },
            wins: {
                label: "Wins",
                fn: (a, b) => (a.stats?.wins ?? 0) - (b.stats?.wins ?? 0),
            },
            losses: {
                label: "Losses",
                fn: (a, b) =>
                    (a.stats?.games ?? 0) -
                    (a.stats?.wins ?? 0) -
                    ((b.stats?.games ?? 0) - (b.stats?.wins ?? 0)),
            },
            winrate: {
                label: "Winrate",
                fn: (a, b) =>
                    calculateWinrate(a.stats?.wins ?? 0, a.stats?.games ?? 0) -
                    calculateWinrate(b.stats?.wins ?? 0, b.stats?.games ?? 0),
            },
            rating: {
                label: "Elo",
                fn: (a, b) => (a.ranked?.rating ?? 0) - (b.ranked?.rating ?? 0),
            },
            peak_rating: {
                label: "Peak elo",
                fn: (a, b) =>
                    (a.ranked?.peak_rating ?? 0) - (b.ranked?.peak_rating ?? 0),
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
        },
        {
            name: "Total legends level",
            value: filteredLegends.reduce(
                (level, legend) => level + (legend.stats?.level ?? 0),
                0,
            ),
        },
        {
            name: "Avg. level",
            value: (
                filteredLegends.reduce(
                    (level, legend) => level + (legend.stats?.level ?? 0),
                    0,
                ) / legends.length
            ).toFixed(0),
        },
    ]

    return (
        <>
            <div className="flex gap-4 mt-8 items-center">
                <Select<Weapon | "">
                    className="flex-1"
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
                />
                <Select<LegendSortOption>
                    className="flex-1"
                    onChange={sortLegendBy}
                    value={legendSortBy}
                    options={legendSortOptions}
                />
                <button
                    onClick={changeLegendSortDirection}
                    className="flex items-center"
                >
                    {legendSortDirection === SortDirection.Ascending ? (
                        <SortAscendingIcon className="w-6 h-6" />
                    ) : (
                        <SortDescendingIcon className="w-6 h-6" />
                    )}
                </button>
            </div>
            <MiscStatGroup className="mt-8" stats={globalLegendsStats} />
            <div className="flex flex-col gap-2 mt-8">
                {sortedLegends
                    .filter(
                        (legend) =>
                            !weaponFilter ||
                            [legend.weapon_one, legend.weapon_two].includes(
                                weaponFilter,
                            ),
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
