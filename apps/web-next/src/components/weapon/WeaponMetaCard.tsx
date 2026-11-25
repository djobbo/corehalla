import { Card } from "@/components/ui/card"
import { MetaFloorChips } from "@/components/common/MetaFloorChips"
import { StatGrid } from "@/components/common/StatGrid"
import { metaDisclaimer, metaFloorSample } from "@/lib/metaFloor"
import {
    formatWeaponMetaCount,
    formatWeaponMetaDuration,
    formatWeaponMetaRate,
    weaponMetaRank,
    weaponMetaRankLabel,
} from "@/lib/weaponMeta"
import type { Stat } from "@/components/common/StatGrid"
import type { WeaponMetaMetric, WeaponMetaRow } from "@/lib/weaponMeta"
import type { MetaFloor, WeaponMeta } from "@crh/api-contract/schemas"
import type { Weapon } from "@crh/bhapi/constants"

type MetricDefinition = {
    readonly metric: WeaponMetaMetric
    readonly title: string
    readonly format: (row: WeaponMetaRow | null) => string
}

const weaponMetaMetrics: readonly MetricDefinition[] = [
    {
        metric: "playShare",
        title: "Play share",
        format: (row) => formatWeaponMetaRate(row?.playShare ?? null),
    },
    {
        metric: "winRate",
        title: "Win rate",
        format: (row) => formatWeaponMetaRate(row?.winRate ?? null),
    },
    {
        metric: "games",
        title: "Games",
        format: (row) => formatWeaponMetaCount(row?.games ?? null),
    },
    {
        metric: "accounts",
        title: "Accounts",
        format: (row) => formatWeaponMetaCount(row?.accounts ?? null),
    },
    {
        metric: "damagePerGame",
        title: "Damage per game",
        format: (row) => formatWeaponMetaCount(row?.damagePerGame ?? null),
    },
    {
        metric: "timeHeldPerGame",
        title: "Time held per game",
        format: (row) => formatWeaponMetaDuration(row?.timeHeldPerGame ?? null),
    },
]

export type WeaponMetaCardProps = {
    readonly meta: WeaponMeta
    readonly weapon: Weapon
    readonly floor: MetaFloor
    readonly onFloorChange?: (floor: MetaFloor) => void
}

export const WeaponMetaCard = ({
    meta,
    weapon,
    floor,
    onFloorChange,
}: WeaponMetaCardProps) => {
    const row = meta.data.find((entry) => entry.weapon === weapon)

    const stats: readonly Stat[] = weaponMetaMetrics.map(
        ({ metric, title, format }) => {
            const rank = weaponMetaRank(meta.data, weapon, metric)

            return {
                title,
                value: (
                    <span className="flex flex-col gap-0.5">
                        <span>{format(row ?? null)}</span>
                        {rank === null ? null : (
                            <span className="ch-stat-label">
                                {weaponMetaRankLabel(rank, metric)}
                            </span>
                        )}
                    </span>
                ),
            }
        },
    )

    return (
        <section aria-labelledby="weapon-meta-title" className="mb-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="ch-kicker">Standing among weapons</p>
                    <h2
                        id="weapon-meta-title"
                        className="ch-display mt-1 text-lg"
                    >
                        Meta
                    </h2>
                    <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                        {metaFloorSample(meta.meta.accounts, floor)} ·{" "}
                        {metaDisclaimer}
                    </p>
                </div>

                <MetaFloorChips floor={floor} onFloorChange={onFloorChange} />
            </div>

            <Card className="mt-3 p-4">
                <StatGrid maxColumns={3} stats={stats} />
            </Card>
        </section>
    )
}
