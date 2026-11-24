import { Schema } from "effect"
import { PlayerRefSchema, TierSchema, envelope } from "./common"

const RankedRowSchema = Schema.Struct({
    rank: Schema.Finite,
    rating: Schema.Finite,
    peak_rating: Schema.Finite,
    tier: TierSchema,
    games: Schema.Finite,
    wins: Schema.Finite,
    region: Schema.String,
})

const BestLegendSchema = Schema.Struct({
    id: Schema.Finite,
    name: Schema.String,
    slug: Schema.String,
    games: Schema.Finite,
    wins: Schema.Finite,
})

export const Ranking1v1RowSchema = Schema.Struct({
    ...RankedRowSchema.fields,
    id: Schema.Finite,
    name: Schema.String,
    slug: Schema.String,
    /** Null means unknown (v1 stopped sending it), not "no legend". */
    best_legend: Schema.NullOr(BestLegendSchema),
})

export const Ranking2v2RowSchema = Schema.Struct({
    ...RankedRowSchema.fields,
    team: Schema.Tuple([PlayerRefSchema, PlayerRefSchema]),
})

export const Ranking3v3RowSchema = Schema.Struct({
    ...RankedRowSchema.fields,
    id: Schema.Finite,
    name: Schema.String,
    slug: Schema.String,
})

export type Ranking1v1Row = typeof Ranking1v1RowSchema.Type
export type Ranking2v2Row = typeof Ranking2v2RowSchema.Type
export type Ranking3v3Row = typeof Ranking3v3RowSchema.Type

export const Rankings1v1EnvelopeSchema = envelope(
    Schema.Array(Ranking1v1RowSchema),
)
export const Rankings2v2EnvelopeSchema = envelope(
    Schema.Array(Ranking2v2RowSchema),
)
export const Rankings3v3EnvelopeSchema = envelope(
    Schema.Array(Ranking3v3RowSchema),
)

export type Rankings1v1Envelope = typeof Rankings1v1EnvelopeSchema.Type
export type Rankings2v2Envelope = typeof Rankings2v2EnvelopeSchema.Type
export type Rankings3v3Envelope = typeof Rankings3v3EnvelopeSchema.Type

/** Same shape for player/legend/weapon boards; filter and sort column are query params. */
export const CareerRankingSchema = Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    slug: Schema.String,
    tier: Schema.String,
    rating: Schema.Finite,
    region: Schema.String,
    peakRating: Schema.Finite,
    /** Value of whichever column the request sorted by. */
    prop: Schema.Finite,
})

export type CareerRanking = typeof CareerRankingSchema.Type

/** Archive builds the row; HTTP layer adds the slug. See `LookupResultInput`. */
export type CareerRankingInput = Omit<CareerRanking, "slug">

export const CareerRankingsSchema = Schema.Array(CareerRankingSchema)

/**
 * One ladder entry (player or team). `members` is always a list so the
 * renderer does not branch on bracket.
 */
export const QueuedEntrySchema = Schema.Struct({
    id: Schema.String,
    members: Schema.Array(
        Schema.Struct({
            id: Schema.String,
            name: Schema.String,
            slug: Schema.String,
        }),
    ),
    rating: Schema.Finite,
    peakRating: Schema.Finite,
    tier: Schema.String,
    games: Schema.Finite,
    wins: Schema.Finite,
    /** Epoch milliseconds; only compared against "now". */
    queuedAt: Schema.Finite,
    rank: Schema.Finite,
    ratingDelta: Schema.Finite,
    rankDelta: Schema.Finite,
})

export type QueuedEntry = typeof QueuedEntrySchema.Type

export const RankedQueueSchema = Schema.Array(QueuedEntrySchema)

export const ClanRankingSchema = Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    slug: Schema.String,
    nameLower: Schema.String,
    created: Schema.NullOr(Schema.Finite),
    xp: Schema.Finite,
})

export type ClanRanking = typeof ClanRankingSchema.Type

export const ClansSchema = Schema.Array(ClanRankingSchema)

export const LegendSchema = Schema.Struct({
    legend_id: Schema.Finite,
    legend_name_key: Schema.String,
    bio_name: Schema.String,
    bio_aka: Schema.String,
    weapon_one: Schema.String,
    weapon_two: Schema.String,
    strength: Schema.String,
    dexterity: Schema.String,
    defense: Schema.String,
    speed: Schema.String,
})

export const WeeklyRotationSchema = Schema.Array(LegendSchema)
