import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { SortControl } from "@/components/common/SortControl"
import { StatGrid } from "@/components/common/StatGrid"
import { WeaponRow } from "./WeaponRow"
import {
    playerLegendsAtom,
    playerProfileAtom,
    playerWeaponsAtom,
    useQuery,
} from "@/effect/atoms"
import { useSortBy } from "@/lib/useSortBy"
import { calculateWinrate } from "@crh/bhapi/helpers/calculateWinrate"
import { formatTime } from "@crh/common/helpers/date"
import type { Stat } from "@/components/common/StatGrid"
import type { PlayerLegend, PlayerWeapon } from "@crh/api-contract/schemas"
import type { SortOption } from "@/lib/useSortBy"

type WeaponSort =
    | "matchtime"
    | "level"
    | "games"
    | "wins"
    | "losses"
    | "winrate"
    | "name"

const losses = (weapon: PlayerWeapon): number =>
    weapon.stats.games - weapon.stats.wins
const winrate = (weapon: PlayerWeapon): number =>
    calculateWinrate(weapon.stats.wins, weapon.stats.games)

const sortOptions: Record<WeaponSort, SortOption<PlayerWeapon>> = {
    matchtime: {
        label: "Time held",
        compare: (a, b) => a.stats.time_held - b.stats.time_held,
        display: (weapon) => formatTime(weapon.stats.time_held),
    },
    level: {
        label: "Weapon level",
        compare: (a, b) => a.stats.level - b.stats.level,
        display: (weapon) =>
            `Level ${weapon.stats.level} · ${weapon.stats.xp.toLocaleString()} xp`,
    },
    games: {
        label: "Games",
        compare: (a, b) => a.stats.games - b.stats.games,
        display: (weapon) => `${weapon.stats.games.toLocaleString()} games`,
    },
    wins: {
        label: "Wins",
        compare: (a, b) => a.stats.wins - b.stats.wins,
        display: (weapon) => `${weapon.stats.wins.toLocaleString()} wins`,
    },
    losses: {
        label: "Losses",
        compare: (a, b) => losses(a) - losses(b),
        display: (weapon) => `${losses(weapon).toLocaleString()} losses`,
    },
    winrate: {
        label: "Winrate",
        compare: (a, b) => winrate(a) - winrate(b),
        display: (weapon) => `${winrate(weapon).toFixed(2)}% winrate`,
    },
    name: {
        label: "Name",
        compare: (a, b) => a.name.localeCompare(b.name),
    },
}

export const WeaponsTab = ({ playerId }: { readonly playerId: number }) => {
    const weapons = useQuery(playerWeaponsAtom(playerId)).data
    const allLegends = useQuery(playerLegendsAtom(playerId)).data
    const profile = useQuery(playerProfileAtom(playerId)).data

    const legends = useMemo(
        () =>
            new Map<number, PlayerLegend>(
                allLegends.map((legend) => [legend.id, legend]),
            ),
        [allLegends],
    )

    const sort = useSortBy(weapons, sortOptions, "matchtime", "desc")

    const played = weapons.filter((weapon) => weapon.stats.games > 0).length

    const totals = weapons.reduce(
        (sum, weapon) => ({
            games: sum.games + weapon.stats.games,
            wins: sum.wins + weapon.stats.wins,
            timeHeld: sum.timeHeld + weapon.stats.time_held,
        }),
        { games: 0, wins: 0, timeHeld: 0 },
    )

    const summary: Stat[] = [
        {
            title: "Weapons played",
            value: `${played} / ${weapons.length}`,
            hint: "Weapons used at least once",
        },
        { title: "Total time held", value: formatTime(totals.timeHeld) },
        { title: "Total games", value: totals.games.toLocaleString() },
        {
            title: "Winrate",
            value: `${calculateWinrate(totals.wins, totals.games).toFixed(2)}%`,
        },
    ]

    if (weapons.length === 0) {
        return (
            <Empty className="rounded-2xl bg-card py-10">
                <EmptyHeader>
                    <EmptyDescription>
                        No weapon usage recorded.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <StatGrid stats={summary} />
                </CardContent>
            </Card>
            <SortControl
                label="Sort by"
                value={sort.key}
                choices={sort.choices}
                onChange={sort.setKey}
                direction={sort.direction}
                onToggleDirection={sort.toggleDirection}
                className="sm:max-w-sm"
            />
            <div className="flex flex-col gap-3">
                {sort.sorted.map((weapon, index) => (
                    <WeaponRow
                        key={weapon.name}
                        weapon={weapon}
                        legends={legends}
                        rank={
                            sort.direction === "asc"
                                ? sort.sorted.length - index
                                : index + 1
                        }
                        matchtime={profile.stats.matchtime}
                        games={profile.stats.games}
                        display={sort.display?.(weapon)}
                    />
                ))}
            </div>
        </div>
    )
}
