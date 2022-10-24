import { Card } from "ui/base/Card"
import { CollapsibleSection } from "@components/layout/CollapsibleSection"
import { MiscStatGroup } from "@components/stats/MiscStatGroup"
import { formatTime } from "common/helpers/date"
import Image from "next/image"
import type { FullLegend } from "bhapi/legends"

type PlayerLegendWeaponDistributionProps = {
    legend: FullLegend
}

export const PlayerLegendWeaponDistribution = ({
    legend,
}: PlayerLegendWeaponDistributionProps) => {
    const weaponOne = {
        weapon: legend.weapon_one,
        kos: legend.stats?.koweaponone ?? 0,
        damage: parseInt(legend.stats?.damageweaponone ?? "0"),
        timeheld: legend.stats?.timeheldweaponone ?? 0,
    } as const

    const weaponTwo = {
        weapon: legend.weapon_two,
        kos: legend.stats?.koweapontwo ?? 0,
        damage: parseInt(legend.stats?.damageweapontwo ?? "0"),
        timeheld: legend.stats?.timeheldweapontwo ?? 0,
    } as const

    const unarmed = {
        weapon: "Unarmed",
        kos: legend.stats?.kounarmed ?? 0,
        damage: parseInt(legend.stats?.damageunarmed ?? "0"),
        timeheld: legend.stats
            ? legend.stats.matchtime -
              legend.stats.timeheldweaponone -
              legend.stats.timeheldweapontwo
            : 0,
    }

    return (
        <CollapsibleSection trigger="Weapon Distribution">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[weaponOne, weaponTwo, unarmed].map((weapon) => (
                    <Card
                        key={weapon.weapon}
                        title={
                            <span className="flex gap-2 items-center">
                                <span
                                    className="block w-6 h-6 relative"
                                    key={weapon.weapon}
                                >
                                    <Image
                                        src={`/images/icons/weapons/${weapon.weapon}.png`}
                                        alt={weapon.weapon}
                                        layout="fill"
                                        objectFit="contain"
                                        objectPosition="center"
                                    />
                                </span>
                                {weapon.weapon}
                            </span>
                        }
                    >
                        <MiscStatGroup
                            gapClassName="gap-1"
                            column
                            stats={[
                                {
                                    name: "KOs",
                                    value: (
                                        <>
                                            {weapon.kos}{" "}
                                            <span className="text-xs text-textVar1">
                                                (
                                                {legend.stats
                                                    ? `${(
                                                          (weapon.kos /
                                                              legend.stats
                                                                  ?.kos) *
                                                          100
                                                      ).toFixed(2)}%`
                                                    : "0%"}
                                                )
                                            </span>
                                        </>
                                    ),
                                    desc: "Kills with this weapon",
                                },
                                {
                                    name: "Damage dealt",
                                    value: (
                                        <>
                                            {weapon.damage}{" "}
                                            <span className="text-xs text-textVar1">
                                                (
                                                {legend.stats
                                                    ? `${(
                                                          (weapon.damage /
                                                              parseInt(
                                                                  legend.stats
                                                                      .damagedealt,
                                                              )) *
                                                          100
                                                      ).toFixed(2)}%`
                                                    : "0%"}
                                                )
                                            </span>
                                        </>
                                    ),
                                    desc: "Damage dealt with this weapon",
                                },
                                {
                                    name: "Time held",
                                    value: (
                                        <>
                                            {formatTime(weapon.timeheld)}{" "}
                                            <span className="text-xs text-textVar1">
                                                (
                                                {legend.stats
                                                    ? `${(
                                                          (weapon.timeheld /
                                                              legend.stats
                                                                  ?.matchtime) *
                                                          100
                                                      ).toFixed(2)}%`
                                                    : "0%"}
                                                )
                                            </span>
                                        </>
                                    ),
                                    desc: "Time held with this weapon",
                                },
                                {
                                    name: "DPS",
                                    value: `${(
                                        weapon.damage / weapon.timeheld
                                    ).toFixed(1)} dmg/s`,
                                    desc: `Damage dealt per second with this ${weapon.weapon}`,
                                },
                                {
                                    name: "Time to kill",
                                    value: `${(
                                        weapon.timeheld / weapon.kos
                                    ).toFixed(1)}s`,
                                    desc: "Time between each kill in seconds",
                                },
                            ]}
                        />
                    </Card>
                ))}
            </div>
            <MiscStatGroup
                className="mt-4"
                stats={[
                    {
                        name: "Throw KOs",
                        value: legend.stats ? (
                            <>
                                {legend.stats.kothrownitem}{" "}
                                <span className="text-xs text-textVar1">
                                    (
                                    {(
                                        (legend.stats.kothrownitem /
                                            legend.stats.kos) *
                                        100
                                    ).toFixed(2)}
                                    %)
                                </span>
                            </>
                        ) : (
                            "0 (0%)"
                        ),
                        desc: "Kills with thrown items",
                    },
                    {
                        name: "Throw damage",
                        value: legend.stats ? (
                            <>
                                {legend.stats.damagethrownitem}{" "}
                                <span className="text-xs text-textVar1">
                                    (
                                    {(
                                        (parseInt(
                                            legend.stats.damagethrownitem,
                                        ) /
                                            parseInt(
                                                legend.stats.damagedealt,
                                            )) *
                                        100
                                    ).toFixed(2)}
                                    %)
                                </span>
                            </>
                        ) : (
                            "0 (0%)"
                        ),
                        desc: "Damage dealt with thrown items",
                    },
                    {
                        name: "Gadgets KOs",
                        value: legend.stats ? (
                            <>
                                {legend.stats.kogadgets}{" "}
                                <span className="text-xs text-textVar1">
                                    (
                                    {(
                                        (legend.stats.kogadgets /
                                            legend.stats.kos) *
                                        100
                                    ).toFixed(2)}
                                    %)
                                </span>
                            </>
                        ) : (
                            "0 (0%)"
                        ),
                        desc: "Kills with gadgets",
                    },
                    {
                        name: "Gadgets damage",
                        value: legend.stats ? (
                            <>
                                {legend.stats.damagegadgets}{" "}
                                <span className="text-xs text-textVar1">
                                    (
                                    {(
                                        (parseInt(legend.stats.damagegadgets) /
                                            parseInt(
                                                legend.stats.damagedealt,
                                            )) *
                                        100
                                    ).toFixed(2)}
                                    %)
                                </span>
                            </>
                        ) : (
                            "0 (0%)"
                        ),
                        desc: "Damage dealt with gadgets",
                    },
                ]}
            />
        </CollapsibleSection>
    )
}
