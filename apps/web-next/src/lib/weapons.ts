import { weapons } from "@crh/bhapi/constants"
import { legends } from "@crh/bhapi/legends"
import { sluggify } from "@crh/common/helpers/sluggify"
import type { Weapon } from "@crh/bhapi/constants"
import type { Legend } from "@crh/bhapi/types"

export const weaponSlug = (weapon: Weapon): string => sluggify(weapon)

export const weaponHref = (weapon: Weapon): string =>
    `/weapons/${weaponSlug(weapon)}`

export const weaponCareerHref = (weapon: Weapon, sortBy: string): string =>
    `/rankings/career/weapons/${encodeURIComponent(weapon)}?sortBy=${sortBy}`

const weaponsBySlug = new Map<string, Weapon>(
    weapons.map((weapon) => [weaponSlug(weapon), weapon]),
)

const decode = (value: string): string => {
    try {
        return decodeURIComponent(value)
    } catch {
        return value
    }
}

/** Accepts the kebab-case slug, the display name and any spelling between. */
export const resolveWeaponSlug = (slug: string): Weapon | null =>
    weaponsBySlug.get(sluggify(decode(slug))) ?? null

export const legendsWithWeapon = (weapon: Weapon): readonly Legend[] =>
    legends.filter(
        (legend) =>
            legend.weapon_one === weapon || legend.weapon_two === weapon,
    )
