import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { SelectField } from "@/components/SelectField"
import { SortControl } from "@/components/SortControl"
import { StatGrid } from "@/components/StatGrid"
import { LegendRow } from "./LegendRow"
import { playerProfileAtom, useQuery } from "@/effect/atoms"
import { ratio } from "@/lib/stats"
import { useSortBy } from "@/lib/useSortBy"
import { calculateWinrate } from "@crh/bhapi/helpers/calculateWinrate"
import { weapons as allWeapons } from "@crh/bhapi/constants"
import { formatTime } from "@crh/common/helpers/date"
import type { PlayerLegend } from "@crh/api-contract/schemas"
import type { SortOption } from "@/lib/useSortBy"
import type { Stat } from "@/components/StatGrid"
import type { Weapon } from "@crh/bhapi/constants"

type LegendSort =
    | "level"
    | "matchtime"
    | "games"
    | "wins"
    | "losses"
    | "winrate"
    | "rating"
    | "peak"
    | "name"

const games = (legend: PlayerLegend): number => legend.stats.games
const wins = (legend: PlayerLegend): number => legend.stats.wins
const losses = (legend: PlayerLegend): number => games(legend) - wins(legend)
const winrate = (legend: PlayerLegend): number =>
    calculateWinrate(wins(legend), games(legend))

// Module scope: `useSortBy` sorts every render and keys into this record.
const sortOptions: Record<LegendSort, SortOption<PlayerLegend>> = {
    level: {
        label: "Level",
        compare: (a, b) => a.stats.level - b.stats.level,
        display: (legend) =>
            `Level ${legend.stats.level} · ${legend.stats.xp.toLocaleString()} xp`,
    },
    matchtime: {
        label: "Time played",
        compare: (a, b) => a.stats.matchtime - b.stats.matchtime,
        display: (legend) => formatTime(legend.stats.matchtime),
    },
    games: {
        label: "Games",
        compare: (a, b) => games(a) - games(b),
        display: (legend) => `${games(legend).toLocaleString()} games`,
    },
    wins: {
        label: "Wins",
        compare: (a, b) => wins(a) - wins(b),
        display: (legend) => `${wins(legend).toLocaleString()} wins`,
    },
    losses: {
        label: "Losses",
        compare: (a, b) => losses(a) - losses(b),
        display: (legend) => `${losses(legend).toLocaleString()} losses`,
    },
    winrate: {
        label: "Winrate",
        compare: (a, b) => winrate(a) - winrate(b),
        display: (legend) => `${winrate(legend).toFixed(2)}% winrate`,
    },
    rating: {
        label: "Elo",
        compare: (a, b) => (a.ranked?.rating ?? 0) - (b.ranked?.rating ?? 0),
        display: (legend) => `${legend.ranked?.rating ?? 0} elo`,
    },
    peak: {
        label: "Peak elo",
        compare: (a, b) =>
            (a.ranked?.peak_rating ?? 0) - (b.ranked?.peak_rating ?? 0),
        display: (legend) => `${legend.ranked?.peak_rating ?? 0} peak elo`,
    },
    name: {
        label: "Name",
        compare: (a, b) => a.name.localeCompare(b.name),
    },
}

const weaponChoices: readonly { value: Weapon | ""; label: string }[] = [
    { value: "", label: "All weapons" },
    ...allWeapons.map((weapon) => ({ value: weapon, label: weapon })),
]

export const LegendsTab = ({ playerId }: { readonly playerId: number }) => {
    const profile = useQuery(playerProfileAtom(playerId)).data
    const [weaponFilter, setWeaponFilter] = useState<Weapon | "">("")

    const legends = profile.legends

    const filtered = useMemo(
        () =>
            legends.filter(
                (legend) =>
                    weaponFilter === "" ||
                    legend.weapon_one.name === weaponFilter ||
                    legend.weapon_two.name === weaponFilter,
            ),
        [legends, weaponFilter],
    )

    const sort = useSortBy(filtered, sortOptions, "level", "desc")

    const played = filtered.filter(
        (legend) => legend.stats.matchtime > 0,
    ).length
    const rankedPlayed = filtered.filter(
        (legend) => (legend.ranked?.games ?? 0) > 0,
    ).length
    const totalLevel = filtered.reduce(
        (sum, legend) => sum + legend.stats.level,
        0,
    )

    const summary: Stat[] = [
        {
            title: "Legends played",
            value: `${played} / ${filtered.length}`,
            hint: "Legends played at least once",
        },
        {
            title: "Played in ranked",
            value: `${rankedPlayed} / ${filtered.length}`,
            hint: "Legends played at least once in ranked 1v1 this season",
        },
        { title: "Total legend levels", value: totalLevel.toLocaleString() },
        {
            title: "Average level",
            value: ratio(totalLevel, filtered.length).toFixed(0),
        },
    ]

    return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <SortControl
                    label="Sort by"
                    value={sort.key}
                    choices={sort.choices}
                    onChange={sort.setKey}
                    direction={sort.direction}
                    onToggleDirection={sort.toggleDirection}
                />
                <SelectField
                    label="Filter by weapon"
                    value={weaponFilter}
                    options={weaponChoices}
                    onChange={setWeaponFilter}
                />
            </div>
            <Card className="bg-background">
                <CardContent>
                    <StatGrid stats={summary} />
                </CardContent>
            </Card>
            {sort.sorted.length === 0 ? (
                <Empty className="bg-bgVar2 py-10">
                    <EmptyHeader>
                        <EmptyDescription>
                            No legends use {weaponFilter}.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="flex flex-col gap-3">
                    {sort.sorted.map((legend, index) => (
                        <LegendRow
                            key={legend.id}
                            legend={legend}
                            rank={
                                sort.direction === "asc"
                                    ? sort.sorted.length - index
                                    : index + 1
                            }
                            matchtime={profile.stats.matchtime}
                            games={profile.stats.games}
                            display={sort.display?.(legend)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
