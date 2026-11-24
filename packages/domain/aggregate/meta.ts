import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { legendsMap } from "@crh/bhapi/legends"
import { weapons } from "@crh/bhapi/constants"
import type {
    LegendMeta,
    LegendMetaFloor,
    WeaponMeta,
} from "@crh/api-contract/schemas"
import type { Weapon } from "@crh/bhapi/constants"

export type LegendMetaRowInput = {
    readonly legendId: number
    readonly games: number
    readonly wins: number
    readonly accounts: number
}

export type LegendMetaSample = {
    readonly accounts: number
    readonly floor: LegendMetaFloor
}

/** Four decimals of a fraction; a zero denominator reads as zero, never NaN. */
const fraction = (part: number, whole: number): number =>
    whole <= 0 ? 0 : Math.round((part / whole) * 10_000) / 10_000

export const buildLegendMeta = (
    rows: readonly LegendMetaRowInput[],
    sample: LegendMetaSample,
): LegendMeta => {
    const totalGames = rows.reduce((sum, row) => sum + row.games, 0)

    return {
        data: rows.flatMap((row) => {
            const legend = legendsMap[row.legendId]

            if (legend === undefined || row.games <= 0) return []

            return [
                {
                    legendId: row.legendId,
                    slug: getEntitySlug(legend.legend_id, legend.bio_name),
                    games: row.games,
                    wins: row.wins,
                    winRate: fraction(row.wins, row.games),
                    playShare: fraction(row.games, totalGames),
                    accounts: row.accounts,
                },
            ]
        }),
        meta: {
            accounts: sample.accounts,
            ratingFloor: sample.floor === "all" ? null : Number(sample.floor),
        },
    }
}

export type WeaponMetaRowInput = {
    readonly weapon: string
    readonly games: number
    readonly wins: number
    readonly accounts: number
    readonly damageDealt: number
    readonly matchTime: number
    readonly kos: number
}

export type WeaponMetaSample = {
    readonly accounts: number
}

/** Two decimals of an average; null when there is nothing to divide by. */
const perGame = (total: number, games: number): number | null =>
    games <= 0 ? null : Math.round((total / games) * 100) / 100

const nullableFraction = (part: number, whole: number): number | null =>
    whole <= 0 ? null : Math.round((part / whole) * 10_000) / 10_000

const isWeapon = (value: string): value is Weapon =>
    (weapons as readonly string[]).includes(value)

export const buildWeaponMeta = (
    rows: readonly WeaponMetaRowInput[],
    sample: WeaponMetaSample,
): WeaponMeta => {
    const kept = rows.filter(
        (row): row is WeaponMetaRowInput & { readonly weapon: Weapon } =>
            row.games > 0 && isWeapon(row.weapon),
    )
    const totalGames = kept.reduce((sum, row) => sum + row.games, 0)

    return {
        data: kept.map((row) => ({
            weapon: row.weapon,
            games: row.games,
            wins: row.wins,
            winRate: nullableFraction(row.wins, row.games),
            playShare: nullableFraction(row.games, totalGames),
            accounts: row.accounts,
            damagePerGame: perGame(row.damageDealt, row.games),
            timeHeldPerGame: perGame(row.matchTime, row.games),
            kosPerGame: perGame(row.kos, row.games),
        })),
        meta: { accounts: sample.accounts },
    }
}
