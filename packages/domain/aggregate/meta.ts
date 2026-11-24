import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import { legendsMap } from "@crh/bhapi/legends"
import { weapons } from "@crh/bhapi/constants"
import type {
    LegendMeta,
    LegendMetaFloor,
    LegendPlayStyle,
    WeaponMeta,
} from "@crh/api-contract/schemas"
import type { Weapon } from "@crh/bhapi/constants"

export type LegendPlayStyleTotals = {
    /** Accounts whose legend rows reported at least one game. */
    readonly accounts: number
    readonly damageDealt: number
    readonly damageTaken: number
    readonly kos: number
    readonly falls: number
    readonly suicides: number
    readonly matchTime: number
    readonly timeHeldWeaponOne: number
    readonly timeHeldWeaponTwo: number
}

export type LegendMetaRowInput = {
    readonly legendId: number
    readonly games: number
    readonly wins: number
    readonly accounts: number
    readonly playStyle: LegendPlayStyleTotals
}

export type LegendMetaSample = {
    readonly accounts: number
    readonly floor: LegendMetaFloor
}

const round = (value: number, decimals: number): number => {
    const factor = 10 ** decimals

    return Math.round(value * factor) / factor
}

/** Four decimals of a fraction; a zero denominator reads as zero, never NaN. */
const fraction = (part: number, whole: number): number =>
    whole <= 0 ? 0 : round(part / whole, 4)

/** A fraction that has no meaningful value without a denominator reads as absent. */
const nullableFraction = (part: number, whole: number): number | null =>
    whole <= 0 ? null : fraction(part, whole)

/** `null` instead of a division by zero — an absent metric, not a zero. */
const perGame = (
    total: number,
    games: number,
    decimals: number,
): number | null => (games <= 0 ? null : round(total / games, decimals))

const playStyle = (
    totals: LegendPlayStyleTotals,
    games: number,
): LegendPlayStyle => {
    const held = totals.timeHeldWeaponOne + totals.timeHeldWeaponTwo
    const weaponOneShare =
        held <= 0 ? null : round(totals.timeHeldWeaponOne / held, 4)

    return {
        accounts: totals.accounts,
        damageDealtPerGame: perGame(totals.damageDealt, games, 2),
        damageTakenPerGame: perGame(totals.damageTaken, games, 2),
        kosPerGame: perGame(totals.kos, games, 2),
        fallsPerGame: perGame(totals.falls, games, 2),
        suicidesPer100Games: perGame(totals.suicides * 100, games, 2),
        averageMatchSeconds: perGame(totals.matchTime, games, 0),
        weaponOneShare,
        weaponTwoShare:
            weaponOneShare === null ? null : round(1 - weaponOneShare, 4),
    }
}

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
                    playStyle: playStyle(row.playStyle, row.games),
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
            damagePerGame: perGame(row.damageDealt, row.games, 2),
            timeHeldPerGame: perGame(row.matchTime, row.games, 2),
            kosPerGame: perGame(row.kos, row.games, 2),
        })),
        meta: { accounts: sample.accounts },
    }
}
