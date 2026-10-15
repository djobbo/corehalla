import { useMemo } from "react"
import { BubbleChart } from "@/components/charts/BubbleChart"
import { toWeaponBubbles } from "@/lib/weaponBubbles"
import { formatTime } from "@crh/common/helpers/date"
import type { Player, PlayerWeapon } from "@crh/api-contract/schemas"

/** Weapons are many and more evenly held, so flatten the playtime spread. */
const SCALE_EXPONENT = 0.9

export const WeaponBubbleChart = ({
    weapons,
    unarmed,
}: {
    readonly weapons: readonly PlayerWeapon[]
    readonly unarmed: Player["unarmed"]
}) => {
    const bubbles = useMemo(
        () => toWeaponBubbles(weapons, unarmed),
        [weapons, unarmed],
    )

    return (
        <BubbleChart
            bubbles={bubbles}
            subject="Weapon"
            caption="Top playtime weapons"
            metricHeading="Time held"
            formatValue={(bubble) => formatTime(bubble.matchtime)}
            scaleExponent={SCALE_EXPONENT}
            idPrefix="weapon"
        />
    )
}
