import { Schema } from "effect"
import { weapons } from "@crh/bhapi/constants"

/**
 * Rating floors over the archived population. `all` is the whole index; the
 * numeric entries are inclusive lower bounds on the account's ranked 1v1
 * rating.
 */
export const legendMetaFloors = ["all", "1500", "1800", "2000", "2200"] as const

export const LegendMetaFloor = Schema.Literals(legendMetaFloors)

export type LegendMetaFloor = typeof LegendMetaFloor.Type

/** `null` for the whole index, otherwise the inclusive rating bound. */
export const legendMetaFloorRating = (floor: LegendMetaFloor): number | null =>
    floor === "all" ? null : Number(floor)

/**
 * Per-game play-style profile for one legend. Every metric is `null` when the
 * sample has no input for it — the card renders a dash, never a made-up zero.
 * Weapon shares are fractions of held weapon time and add up to one.
 */
export const LegendPlayStyleSchema = Schema.Struct({
    /** Indexed accounts whose rows reported at least one game. */
    accounts: Schema.Finite,
    damageDealtPerGame: Schema.NullOr(Schema.Finite),
    damageTakenPerGame: Schema.NullOr(Schema.Finite),
    kosPerGame: Schema.NullOr(Schema.Finite),
    fallsPerGame: Schema.NullOr(Schema.Finite),
    suicidesPer100Games: Schema.NullOr(Schema.Finite),
    averageMatchSeconds: Schema.NullOr(Schema.Finite),
    weaponOneShare: Schema.NullOr(Schema.Finite),
    weaponTwoShare: Schema.NullOr(Schema.Finite),
})

export type LegendPlayStyle = typeof LegendPlayStyleSchema.Type

/**
 * Rates are fractions of one, rounded to four decimals by the aggregate — not
 * percentages. `playShare` divides by every legend game in the sample, so the
 * shares of a non-empty board sum to (approximately) one.
 */
export const LegendMetaRowSchema = Schema.Struct({
    legendId: Schema.Finite,
    /** Links to the legend page; do not re-derive on the client. */
    slug: Schema.String,
    games: Schema.Finite,
    wins: Schema.Finite,
    winRate: Schema.Finite,
    playShare: Schema.Finite,
    /** Indexed accounts with at least one game on this legend in the sample. */
    accounts: Schema.Finite,
    playStyle: LegendPlayStyleSchema,
})

export type LegendMetaRow = typeof LegendMetaRowSchema.Type

export const LegendMetaSchema = Schema.Struct({
    data: Schema.Array(LegendMetaRowSchema),
    meta: Schema.Struct({
        /** Indexed accounts matching the floor. */
        accounts: Schema.Finite,
        ratingFloor: Schema.NullOr(Schema.Finite),
    }),
})

export type LegendMeta = typeof LegendMetaSchema.Type

/**
 * `null` means the denominator was empty — the API never emits NaN or a
 * fabricated zero. `playShare` divides by every weapon game in the sample, so a
 * non-empty board sums to (approximately) one.
 */
export const WeaponMetaRowSchema = Schema.Struct({
    weapon: Schema.Literals(weapons),
    games: Schema.Finite,
    wins: Schema.Finite,
    winRate: Schema.NullOr(Schema.Finite),
    playShare: Schema.NullOr(Schema.Finite),
    /** Indexed accounts with at least one game on this weapon. */
    accounts: Schema.Finite,
    damagePerGame: Schema.NullOr(Schema.Finite),
    timeHeldPerGame: Schema.NullOr(Schema.Finite),
    kosPerGame: Schema.NullOr(Schema.Finite),
})

export type WeaponMetaRow = typeof WeaponMetaRowSchema.Type

export const WeaponMetaSchema = Schema.Struct({
    data: Schema.Array(WeaponMetaRowSchema),
    meta: Schema.Struct({
        /** Indexed accounts in the sample. */
        accounts: Schema.Finite,
    }),
})

export type WeaponMeta = typeof WeaponMetaSchema.Type
