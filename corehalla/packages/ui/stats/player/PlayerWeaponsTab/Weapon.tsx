import { Card } from "ui/base/Card"
import { CollapsibleSection } from "ui/layout/CollapsibleSection"
import { GamesDisplay } from "ui/stats/GamesDisplay"
import { MiscStatGroup } from "ui/stats/MiscStatGroup"
import { border } from "ui/theme"
import { cn } from "common/helpers/classnames"
import { formatTime } from "common/helpers/date"
import Image from "next/image"
import type { FullWeapon } from "bhapi/legends"
import type { MiscStat } from "ui/stats/MiscStatGroup"

type WeaponProps = {
    weapon: FullWeapon & {
        games: number
        wins: number
        level: number
        xp: number
        kos: number
        damageDealt: number
        matchtime: number
    }
    matchtime: number
    games: number
}

export const Weapon = ({ weapon, matchtime, games }: WeaponProps) => {
    const weaponStats: MiscStat[] = [
        {
            name: "Weapon level",
            value: weapon.level,
        },
        {
            name: "Avg. legend level",
            value: (weapon.level / weapon.legends.length).toFixed(0),
        },
        {
            name: "Weapon xp",
            value: weapon.xp,
        },
        {
            name: "Avg. legend xp",
            value: (weapon.xp / weapon.legends.length).toFixed(0),
        },
        {
            name: "Time held",
            value: `${formatTime(weapon.matchtime)}`,
        },
        {
            name: "Time held %",
            value: `${((weapon.matchtime / matchtime) * 100).toFixed(2)}%`,
        },
        {
            name: "Usage rate (games)",
            value: `${((weapon.games / games) * 100).toFixed(2)}%`,
        },
        {
            name: "KOs",
            value: weapon.kos,
        },
        {
            name: "Avg. Kos per game",
            value: (weapon.kos / weapon.games).toFixed(2),
        },
        {
            name: "Damage Dealt",
            value: weapon.damageDealt,
        },
        {
            name: "DPS",
            value: `${(weapon.damageDealt / weapon.matchtime).toFixed(
                2,
            )} dmg/s`,
        },
        {
            name: "Avg. dmg dealt per game",
            value: (weapon.damageDealt / weapon.games).toFixed(2),
        },
    ]

    return (
        <CollapsibleSection
            key={weapon.weapon}
            className={cn("shadow-md p-4 border rounded", border("blue4"))}
            triggerClassName="w-full flex justify-start items-center gap-2"
            contentClassName="pt-4"
            trigger={
                <>
                    <span className="relative w-6 h-6">
                        <Image
                            src={`/images/icons/weapons/${weapon.weapon}.png`}
                            alt={weapon.weapon}
                            layout="fill"
                            objectFit="contain"
                            objectPosition="center"
                        />
                    </span>
                    {weapon.weapon}
                </>
            }
        >
            <Card title="Games">
                <GamesDisplay games={weapon.games} wins={weapon.wins} />
            </Card>
            <MiscStatGroup className="mt-4" stats={weaponStats} />
        </CollapsibleSection>
    )
}
