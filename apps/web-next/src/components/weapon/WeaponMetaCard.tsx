import { Card } from "@/components/ui/card"
import { MetaFloorChips } from "@/components/common/MetaFloorChips"
import { StatGrid } from "@/components/common/StatGrid"
import { metaDisclaimer, metaFloorSample } from "@/lib/metaFloor"
import {
    formatWeaponMetaCount,
    formatWeaponMetaDuration,
    formatWeaponMetaRate,
    weaponMetaRankLabel,
    weaponPlayShareRank,
} from "@/lib/weaponMeta"
import type { Stat } from "@/components/common/StatGrid"
import type { MetaFloor, WeaponMeta } from "@crh/api-contract/schemas"
import type { Weapon } from "@crh/bhapi/constants"

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
    const rank = weaponPlayShareRank(meta.data, weapon)

    const stats: readonly Stat[] = [
        {
            title: "Play share",
            value: formatWeaponMetaRate(row?.playShare ?? null),
        },
        {
            title: "Win rate",
            value: formatWeaponMetaRate(row?.winRate ?? null),
        },
        { title: "Games", value: formatWeaponMetaCount(row?.games ?? null) },
        {
            title: "Accounts",
            value: formatWeaponMetaCount(row?.accounts ?? null),
        },
        {
            title: "Damage per game",
            value: formatWeaponMetaCount(row?.damagePerGame ?? null),
        },
        {
            title: "Time held per game",
            value: formatWeaponMetaDuration(row?.timeHeldPerGame ?? null),
        },
    ]

    return (
        <section aria-labelledby="weapon-meta-title" className="mb-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="ch-kicker">Play share and win rate</p>
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

                <div className="flex flex-wrap items-end gap-3">
                    <MetaFloorChips
                        floor={floor}
                        onFloorChange={onFloorChange}
                    />
                    {rank === null ? null : (
                        <p className="ch-chip ch-chip-off">
                            {weaponMetaRankLabel(rank)}
                        </p>
                    )}
                </div>
            </div>

            <Card className="mt-3 p-4">
                <StatGrid maxColumns={3} stats={stats} />
            </Card>
        </section>
    )
}
