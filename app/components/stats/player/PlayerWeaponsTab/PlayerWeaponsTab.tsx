import { HiSortAscending, HiSortDescending } from "react-icons/hi"
import { Select } from "ui/base/Select"
import { SortDirection, useSortBy } from "common/hooks/useSortBy"
import { Weapon } from "./Weapon"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import { formatTime } from "common/helpers/date"
import { useMemo } from "react"
import type { FullWeapon } from "bhapi/legends"

type PlayerWeaponsTabProps = {
    weapons: FullWeapon[]
    matchtime: number
    games: number
}

type WeaponSortOption =
    | "name"
    | "xp"
    | "games"
    | "wins"
    | "losses"
    | "winrate"
    | "matchtime"

export const PlayerWeaponsTab = ({
    weapons,
    matchtime,
    games,
}: PlayerWeaponsTabProps) => {
    const weaponsStats = useMemo(
        () =>
            weapons.map((weapon) => {
                const data = weapon.legends.reduce(
                    (acc, legend) => {
                        const isWeaponOne = legend.weapon_one === weapon.weapon
                        return {
                            games: acc.games + (legend.stats?.games ?? 0),
                            wins: acc.wins + (legend.stats?.wins ?? 0),
                            kos:
                                acc.kos +
                                ((isWeaponOne
                                    ? legend.stats?.koweaponone
                                    : legend.stats?.koweapontwo) ?? 0),
                            damageDealt:
                                acc.damageDealt +
                                parseInt(
                                    (isWeaponOne
                                        ? legend.stats?.damageweapontwo
                                        : legend.stats?.damageweapontwo) ?? "0",
                                ),
                            matchtime:
                                acc.matchtime +
                                ((isWeaponOne
                                    ? legend.stats?.timeheldweaponone
                                    : legend.stats?.timeheldweapontwo) ?? 0),
                            level: acc.level + (legend.stats?.level ?? 0),
                            xp: acc.xp + (legend.stats?.xp ?? 0),
                        }
                    },
                    {
                        games: 0,
                        wins: 0,
                        kos: 0,
                        damageDealt: 0,
                        matchtime: 0,
                        level: 0,
                        xp: 0,
                    },
                )
                return {
                    ...weapon,
                    ...data,
                }
            }),
        [weapons],
    )

    const {
        sortedArray: sortedWeapons,
        sortBy: weaponSortBy,
        setSortBy: sortWeaponBy,
        options: weaponSortOptions,
        changeSortDirection: changeWeaponSortDirection,
        sortDirection: weaponSortDirection,
        displaySortFn: displayWeaponSortFn,
    } = useSortBy<typeof weaponsStats[number], WeaponSortOption>(
        weaponsStats,
        {
            name: {
                label: "Name",
                sortFn: (a, b) => b.weapon.localeCompare(a.weapon),
            },
            xp: {
                label: "Level / XP",
                sortFn: (a, b) => a.xp - b.xp,
                displayFn: (weapon) => (
                    <>
                        Level {weapon.level ?? 0} ({weapon.xp ?? 0} xp)
                    </>
                ),
            },
            matchtime: {
                label: "Matchtime",
                sortFn: (a, b) => (a.matchtime ?? 0) - (b.matchtime ?? 0),
                displayFn: (weapon) => <>{formatTime(weapon.matchtime ?? 0)}</>,
            },
            games: {
                label: "Games",
                sortFn: (a, b) => (a.games ?? 0) - (b.games ?? 0),
                displayFn: (weapon) => <>{weapon.games ?? 0} games</>,
            },
            wins: {
                label: "Wins",
                sortFn: (a, b) => (a.wins ?? 0) - (b.wins ?? 0),
                displayFn: (weapon) => <>{weapon.wins ?? 0} wins</>,
            },
            losses: {
                label: "Losses",
                sortFn: (a, b) =>
                    (a.games ?? 0) -
                    (a.wins ?? 0) -
                    ((b.games ?? 0) - (b.wins ?? 0)),
                displayFn: (weapon) => (
                    <>{(weapon.games ?? 0) - (weapon.wins ?? 0)} losses</>
                ),
            },
            winrate: {
                label: "Winrate",
                sortFn: (a, b) =>
                    calculateWinrate(a.wins ?? 0, a.games ?? 0) -
                    calculateWinrate(b.wins ?? 0, b.games ?? 0),
                displayFn: (weapon) => (
                    <>
                        {calculateWinrate(
                            weapon.wins ?? 0,
                            weapon.games ?? 0,
                        ).toFixed(2)}
                        % winrate
                    </>
                ),
            },
        },
        "xp",
        SortDirection.Descending,
    )

    return (
        <>
            <div className="mt-14 flex-1 flex gap-4 items-center w-full">
                <Select<WeaponSortOption>
                    className="flex-1"
                    onChange={sortWeaponBy}
                    value={weaponSortBy}
                    options={weaponSortOptions}
                    label="Sort by"
                />
                <button
                    type="button"
                    onClick={changeWeaponSortDirection}
                    className="flex items-center hover:text-accent"
                >
                    {weaponSortDirection === SortDirection.Ascending ? (
                        <HiSortAscending className="w-6 h-6" />
                    ) : (
                        <HiSortDescending className="w-6 h-6" />
                    )}
                </button>
            </div>
            <div className="flex flex-col gap-2 mt-4">
                {sortedWeapons.map((weapon, i) => (
                    <Weapon
                        key={weapon.weapon}
                        weapon={weapon}
                        matchtime={matchtime}
                        games={games}
                        displayedInfoFn={displayWeaponSortFn}
                        rank={
                            weaponSortDirection === SortDirection.Ascending
                                ? sortedWeapons.length - i
                                : i + 1
                        }
                    />
                ))}
            </div>
        </>
    )
}
