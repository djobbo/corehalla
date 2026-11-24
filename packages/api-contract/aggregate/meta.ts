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
 * Rates are fractions of one, rounded to four decimals by the aggregate — not
 * percentages. `playShare` divides by every legend game in the sample, so the
 * shares of a non-empty board sum to (approximately) one.
 */
export const LegendMetaRowSchema = Schema.Struct({
    legendId: Schema.Number,
    /** Links to the legend page; do not re-derive on the client. */
    slug: Schema.String,
    games: Schema.Number,
    wins: Schema.Number,
    winRate: Schema.Number,
    playShare: Schema.Number,
    /** Indexed accounts with at least one game on this legend in the sample. */
    accounts: Schema.Number,
})

export type LegendMetaRow = typeof LegendMetaRowSchema.Type

export const LegendMetaSchema = Schema.Struct({
    data: Schema.Array(LegendMetaRowSchema),
    meta: Schema.Struct({
        /** Indexed accounts matching the floor. */
        accounts: Schema.Number,
        ratingFloor: Schema.NullOr(Schema.Number),
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
    games: Schema.Number,
    wins: Schema.Number,
    winRate: Schema.NullOr(Schema.Number),
    playShare: Schema.NullOr(Schema.Number),
    /** Indexed accounts with at least one game on this weapon. */
    accounts: Schema.Number,
    damagePerGame: Schema.NullOr(Schema.Number),
    timeHeldPerGame: Schema.NullOr(Schema.Number),
    kosPerGame: Schema.NullOr(Schema.Number),
})

export type WeaponMetaRow = typeof WeaponMetaRowSchema.Type

export const WeaponMetaSchema = Schema.Struct({
    data: Schema.Array(WeaponMetaRowSchema),
    meta: Schema.Struct({
        /** Indexed accounts in the sample. */
        accounts: Schema.Number,
    }),
})

export type WeaponMeta = typeof WeaponMetaSchema.Type
