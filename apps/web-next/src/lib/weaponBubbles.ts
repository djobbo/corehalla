import { weaponIconSrc } from "./assets"
import { mediaSlotKey } from "./mediaSlot"
import type { BubbleNode } from "./bubbles"
import type { Player, PlayerWeapon } from "@crh/api-contract/schemas"

const byKey = (a: BubbleNode, b: BubbleNode): number =>
    a.key < b.key ? -1 : a.key > b.key ? 1 : 0

/**
 * One bubble per held weapon plus unarmed, in name order so server and client
 * pack alike. Unarmed is not a wielded weapon, so it is folded in from its own
 * totals and carries no level or record.
 */
export const toWeaponBubbles = (
    weapons: readonly PlayerWeapon[],
    unarmed: Player["unarmed"],
): readonly BubbleNode[] => {
    const bubbles: BubbleNode[] = weapons
        .filter((weapon) => weapon.stats.games > 0)
        .map((weapon) => ({
            key: weapon.name,
            name: weapon.name,
            icon: weaponIconSrc(weapon.name),
            slotKey: mediaSlotKey("weapon.icon", weapon.name),
            level: weapon.stats.level,
            matchtime: weapon.stats.time_held,
            kos: weapon.stats.kos,
            damage_dealt: weapon.stats.damage_dealt,
            games: weapon.stats.games,
            wins: weapon.stats.wins,
        }))

    if (unarmed.time_held > 0) {
        bubbles.push({
            key: "Unarmed",
            name: "Unarmed",
            icon: weaponIconSrc("Unarmed"),
            slotKey: mediaSlotKey("weapon.icon", "Unarmed"),
            matchtime: unarmed.time_held,
            kos: unarmed.kos,
            damage_dealt: unarmed.damage_dealt,
        })
    }

    return bubbles.sort(byKey)
}
