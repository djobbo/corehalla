import { Weapon } from "./Weapon"
import type { FullWeapon } from "bhapi/legends"

type PlayerWeaponsTabProps = {
    weapons: FullWeapon[]
    matchtime: number
    games: number
}

export const PlayerWeaponsTab = ({
    weapons,
    matchtime,
    games,
}: PlayerWeaponsTabProps) => {
    const weaponsStats = weapons.map((weapon) => {
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
    })

    return (
        <div className="flex flex-col gap-2 mt-4">
            {weaponsStats
                .sort((a, b) => b.matchtime - a.matchtime)
                .map((weapon) => (
                    <Weapon
                        key={weapon.weapon}
                        weapon={weapon}
                        matchtime={matchtime}
                        games={games}
                    />
                ))}
        </div>
    )
}
