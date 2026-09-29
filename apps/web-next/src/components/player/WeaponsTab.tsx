import { useMemo } from "react"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { SortControl } from "@/components/SortControl"
import { WeaponRow } from "./WeaponRow"
import { playerProfileAtom, useQuery } from "@/effect/atoms"
import { useSortBy } from "@/lib/useSortBy"
import { calculateWinrate } from "@crh/bhapi/helpers/calculateWinrate"
import { formatTime } from "@crh/common/helpers/date"
import type { PlayerLegend, PlayerWeapon } from "@crh/api-contract/schemas"
import type { SortOption } from "@/lib/useSortBy"

/**
 * Every weapon the account has held, as one sortable list.
 *
 * The mirror of the legends tab, and deliberately so: the two answer the same
 * question from opposite ends ("what does this player play" / "what do they play
 * it with"), so they share the collapsed-row contract and differ only in the
 * figures they show.
 *
 * The roll-up itself is the API's — `weapons` arrives summed across the legends
 * that held each one. What this tab owns is the join back to the legends, so a
 * row can show which of them earned a weapon's ranked record.
 */

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
    const profile = useQuery(playerProfileAtom(playerId)).data
    const weapons = profile.weapons

    /*
     * Each weapon's legends arrive as references; their ranked records live on
     * the legend itself. One map for the whole tab, so a row does not rebuild
     * it while the list sorts.
     */
    const legends = useMemo(
        () =>
            new Map<number, PlayerLegend>(
                profile.legends.map((legend) => [legend.id, legend]),
            ),
        [profile.legends],
    )

    const sort = useSortBy(weapons, sortOptions, "matchtime", "desc")

    if (weapons.length === 0) {
        return (
            <Empty className="bg-bgVar2 py-10">
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
