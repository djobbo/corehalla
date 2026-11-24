import type { WeaponMetaRow } from "@crh/api-contract/schemas"

export type { WeaponMetaRow } from "@crh/api-contract/schemas"

export type WeaponMetaRank = {
    readonly position: number
    readonly total: number
}

/** Locale pinned: the card is server-rendered, so both sides must agree. */
export const formatWeaponMetaCount = (value: number | null): string =>
    value === null ? "—" : Math.round(value).toLocaleString("en-US")

/** Fractions of one; at most two decimals of a percent, without trailing zeros. */
export const formatWeaponMetaRate = (value: number | null): string =>
    value === null ? "—" : `${(value * 100).toFixed(2).replace(/\.?0+$/, "")}%`

/** Whole seconds under a minute, then minutes, then hours. */
export const formatWeaponMetaDuration = (value: number | null): string => {
    if (value === null) return "—"

    const seconds = Math.round(value)

    if (seconds < 60) return `${seconds}s`

    const minutes = Math.floor(seconds / 60)

    if (minutes < 60) {
        const rest = seconds % 60

        return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`
    }

    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60

    return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`
}

export const weaponMetaSample = (accounts: number): string =>
    `Across ${formatWeaponMetaCount(accounts)} indexed accounts`

export const weaponMetaRankLabel = ({
    position,
    total,
}: WeaponMetaRank): string => `#${position} of ${total} by play share`

/**
 * Ties share a position: the rank counts the rows strictly ahead, so two
 * weapons on the same play share land on the same number.
 */
export const weaponPlayShareRank = (
    rows: readonly WeaponMetaRow[],
    weapon: WeaponMetaRow["weapon"],
): WeaponMetaRank | null => {
    const share = rows.find((row) => row.weapon === weapon)?.playShare

    if (share === undefined || share === null) return null

    return {
        position:
            1 +
            rows.filter(
                (row) => row.playShare !== null && row.playShare > share,
            ).length,
        total: rows.length,
    }
}
