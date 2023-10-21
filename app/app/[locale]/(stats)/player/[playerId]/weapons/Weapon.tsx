import { Card } from "ui/base/Card"
import { CollapsibleContent } from "@/components/layout/CollapsibleContent"
import { GamesDisplay } from "@/components/stats/GamesDisplay"
import { Image } from "@/components/Image"
import { type MiscStat, MiscStatGroup } from "@/components/stats/MiscStatGroup"
import { PlayerWeaponRankedContent } from "./RankedContent"
import { formatTime } from "common/helpers/date"
import type { FullWeapon } from "bhapi/legends"

type Weapon = FullWeapon & {
    games: number
    wins: number
    level: number
    xp: number
    kos: number
    damageDealt: number
    matchtime: number
}

type WeaponProps = {
    weapon: Weapon
    matchtime: number
    games: number
    displayedInfoFn?: (weapon: Weapon) => JSX.Element
    rank: number
}

export const Weapon = ({
    weapon,
    matchtime,
    games,
    displayedInfoFn,
    rank,
}: WeaponProps) => {
    const { weapon: weaponName } = weapon
    const weaponStats: MiscStat[] = [
        {
            name: "Weapon level",
            value: weapon.level,
            desc: `Sum of the legends that use ${weaponName}`,
        },
        {
            name: "Avg. legend level",
            value: (weapon.level / weapon.legends.length).toFixed(0),
            desc: `Avg. level of the legends that use ${weaponName}`,
        },
        {
            name: "Weapon xp",
            value: weapon.xp,
            desc: `Sum of the legends that use ${weaponName}`,
        },
        {
            name: "Avg. legend xp",
            value: (weapon.xp / weapon.legends.length).toFixed(0),
            desc: `Avg. xp of the legends that use ${weaponName}`,
        },
        {
            name: `Time held`,
            value: `${formatTime(weapon.matchtime)}`,
            desc: `Time ${weaponName} was held`,
        },
        {
            name: "Time held (%)",
            value: `${((weapon.matchtime / matchtime) * 100).toFixed(2)}%`,
            desc: `Time ${weaponName} was held (percentage of total time)`,
        },
        {
            name: "Usage rate (games)",
            value: `${((weapon.games / games) * 100).toFixed(2)}%`,
            desc: `${weaponName} usage rate (percentage of total games)`,
        },
        {
            name: "KOs",
            value: weapon.kos,
            desc: `KOs with ${weaponName}`,
        },
        {
            name: "Avg. Kos per game",
            value: (weapon.kos / weapon.games).toFixed(2),
            desc: `Average KOs per game with ${weaponName}`,
        },
        {
            name: "Damage Dealt",
            value: weapon.damageDealt,
            desc: `Damage dealt with ${weaponName}`,
        },
        {
            name: "DPS",
            value: `${(weapon.damageDealt / weapon.matchtime).toFixed(
                2,
            )} dmg/s`,
            desc: `Damage dealt per second with ${weaponName}`,
        },
        {
            name: "Avg. dmg dealt per game",
            value: (weapon.damageDealt / weapon.games).toFixed(2),
            desc: `Average damage dealt per game ${weaponName}`,
        },
    ]

    return (
        <CollapsibleContent
            key={weapon.weapon}
            className="shadow-md border rounded-lg border-bg"
            triggerClassName="w-full p-4 flex justify-start items-center gap-2"
            contentClassName="px-4 pb-4"
            trigger={
                <span className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                        <span className="text-sm text-textVar1">{rank}</span>
                        <Image
                            src={`/images/icons/weapons/${weapon.weapon}.png`}
                            alt={weapon.weapon}
                            Container="span"
                            containerClassName="block w-6 h-6"
                            className="object-contain object-center"
                        />
                        {weapon.weapon}
                    </span>
                    <span className="text-sm text-textVar1">
                        {displayedInfoFn?.(weapon)}
                    </span>
                </span>
            }
        >
            <Card title="Games">
                <GamesDisplay games={weapon.games} wins={weapon.wins} />
            </Card>
            <MiscStatGroup className="mt-4" stats={weaponStats} />
            <PlayerWeaponRankedContent weapon={weapon} />
        </CollapsibleContent>
    )
}
