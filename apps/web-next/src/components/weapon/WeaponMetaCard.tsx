import { Card } from "@/components/ui/card"
import { StatGrid } from "@/components/common/StatGrid"
import {
    formatWeaponMetaCount,
    formatWeaponMetaDuration,
    formatWeaponMetaRate,
    weaponMetaRankLabel,
    weaponMetaSample,
    weaponPlayShareRank,
} from "@/lib/weaponMeta"
import type { Stat } from "@/components/common/StatGrid"
import type { WeaponMeta } from "@crh/api-contract/schemas"
import type { Weapon } from "@crh/bhapi/constants"

export type WeaponMetaCardProps = {
    readonly meta: WeaponMeta
    readonly weapon: Weapon
}

export const WeaponMetaCard = ({ meta, weapon }: WeaponMetaCardProps) => {
    const row = meta.data.find((entry) => entry.weapon === weapon)
    const rank = weaponPlayShareRank(meta.data, weapon)

    if (row === undefined || rank === null) return null

    const stats: readonly Stat[] = [
        { title: "Play share", value: formatWeaponMetaRate(row.playShare) },
        { title: "Win rate", value: formatWeaponMetaRate(row.winRate) },
        { title: "Games", value: formatWeaponMetaCount(row.games) },
        { title: "Accounts", value: formatWeaponMetaCount(row.accounts) },
        {
            title: "Damage per game",
            value: formatWeaponMetaCount(row.damagePerGame),
        },
        {
            title: "Time held per game",
            value: formatWeaponMetaDuration(row.timeHeldPerGame),
        },
    ]

    return (
        <section aria-labelledby="weapon-meta-title" className="mb-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <p className="ch-kicker">Play share and win rate</p>
                    <h2
                        id="weapon-meta-title"
                        className="ch-display mt-1 text-lg"
                    >
                        Meta
                    </h2>
                    <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                        {weaponMetaSample(meta.meta.accounts)} · aggregated from
                        Corehalla&apos;s index, not official Brawlhalla figures.
                    </p>
                </div>

                <p className="ch-chip ch-chip-off">
                    {weaponMetaRankLabel(rank)}
                </p>
            </div>

            <Card className="mt-3 p-4">
                <StatGrid maxColumns={3} stats={stats} />
            </Card>
        </section>
    )
}
