import { Card } from "@/components/ui/Card"
import { SortControl } from "@/components/ui/SortControl"
import { WeaponRow } from "./WeaponRow"
import { usePlayerDerived } from "./usePlayerDerived"
import { useSortBy } from "@/lib/useSortBy"
import { calculateWinrate } from "@crh/bhapi/helpers/calculateWinrate"
import { formatTime } from "@crh/common/helpers/date"
import type { SortOption } from "@/lib/useSortBy"
import type { WeaponStats } from "./WeaponRow"

/**
 * Every weapon the account has held, as one sortable list.
 *
 * The mirror of the legends tab, and deliberately so: the two answer the same
 * question from opposite ends ("what does this player play" / "what do they play
 * it with"), so they share the collapsed-row contract and differ only in the
 * figures they show.
 */

type WeaponSort =
    | "matchtime"
    | "level"
    | "games"
    | "wins"
    | "losses"
    | "winrate"
    | "name"

const losses = (weapon: WeaponStats): number => weapon.games - weapon.wins
const winrate = (weapon: WeaponStats): number =>
    calculateWinrate(weapon.wins, weapon.games)

const sortOptions: Record<WeaponSort, SortOption<WeaponStats>> = {
    matchtime: {
        label: "Time held",
        compare: (a, b) => a.matchtime - b.matchtime,
        display: (weapon) => formatTime(weapon.matchtime),
    },
    level: {
        label: "Weapon level",
        compare: (a, b) => a.level - b.level,
        display: (weapon) =>
            `Level ${weapon.level} · ${weapon.xp.toLocaleString()} xp`,
    },
    games: {
        label: "Games",
        compare: (a, b) => a.games - b.games,
        display: (weapon) => `${weapon.games.toLocaleString()} games`,
    },
    wins: {
        label: "Wins",
        compare: (a, b) => a.wins - b.wins,
        display: (weapon) => `${weapon.wins.toLocaleString()} wins`,
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
        compare: (a, b) => a.weapon.localeCompare(b.weapon),
    },
}

export const WeaponsTab = ({ playerId }: { readonly playerId: number }) => {
    const player = usePlayerDerived(playerId)

    const weapons = player?.weapons ?? []

    const sort = useSortBy(weapons, sortOptions, "matchtime", "desc")

    if (!player) return null

    const { stats, totals } = player
    const matchtime = totals.matchtime

    if (weapons.length === 0) {
        return (
            <Card variant="muted" className="grid place-items-center py-10">
                <p className="text-sm text-textVar1">
                    No weapon usage recorded.
                </p>
            </Card>
        )
    }

    return (
        <div className="flex flex-col gap-4">
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
                        key={weapon.weapon}
                        weapon={weapon}
                        rank={
                            sort.direction === "asc"
                                ? sort.sorted.length - index
                                : index + 1
                        }
                        matchtime={matchtime}
                        games={stats.games}
                        display={sort.display?.(weapon)}
                    />
                ))}
            </div>
        </div>
    )
}
