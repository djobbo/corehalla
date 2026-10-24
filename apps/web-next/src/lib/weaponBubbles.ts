import { weaponIconSrc } from "./assets"
import { mediaSlotKey } from "./mediaSlot"
import type { BubbleNode } from "./bubbles"
import type {
    PlayerProfile,
    PlayerWeapon,
    WeaponBubble,
} from "@crh/api-contract/schemas"

const byKey = (a: BubbleNode, b: BubbleNode): number =>
    a.key < b.key ? -1 : a.key > b.key ? 1 : 0

/**
 * One bubble per held weapon plus unarmed, in name order so server and client
 * pack alike. Unarmed is not a wielded weapon, so it is folded in from its own
 * totals and carries no level or record.
 */
export const toWeaponBubbles = (
    weapons: readonly (WeaponBubble | PlayerWeapon)[],
    unarmed: PlayerProfile["unarmed"],
): readonly BubbleNode[] => {
    const bubbles: BubbleNode[] = weapons
        .map((weapon) => ({
            weapon,
            stats: "stats" in weapon ? weapon.stats : weapon,
        }))
        .filter(({ stats }) => stats.games > 0)
        .map(({ weapon, stats }) => ({
            key: weapon.name,
            name: weapon.name,
            icon: weaponIconSrc(weapon.name),
            slotKey: mediaSlotKey("weapon.icon", weapon.name),
            level: stats.level,
            matchtime: stats.time_held,
            kos: stats.kos,
            damage_dealt: stats.damage_dealt,
            games: stats.games,
            wins: stats.wins,
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
