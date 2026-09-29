import { Schema } from "effect"
import { PlayerRefSchema, TierSchema, envelope } from "./common"

/**
 * The three live ladders, in `kubi`'s row shape.
 *
 * The gateway hands handlers the raw upstream rows (`Ranking1v1`,
 * `Ranking2v2`, `Ranking3v3`), which are a near-verbatim copy of v1's payload.
 * These are the product view of the same rows: a slug to link to, both members
 * of a team rather than a pre-joined `teamname` string, and — for 1v1 — an
 * optional best legend.
 *
 * ## Adaptations from kubi
 *
 * - `best_legend` is nullable on purpose. v1 stopped sending it, so a row only
 *   carries one when our own archive has crawled that player's legend table;
 *   `null` is "we do not know", not "no legend".
 * - `region` is our lowercase vocabulary (`us-e`, `jpn`), not v1's uppercase
 *   codes, so a row matches the `region` query parameter that asked for it.
 * - No `slug` on teammates inside `team`: the pair is one `PlayerRef` each, and
 *   a `PlayerRef` already carries its own slug.
 */

const RankedRowSchema = Schema.Struct({
    rank: Schema.Number,
    rating: Schema.Number,
    peak_rating: Schema.Number,
    tier: TierSchema,
    games: Schema.Number,
    wins: Schema.Number,
    region: Schema.String,
})

/** The legend a player has the most games on, when we know it. */
const BestLegendSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
    games: Schema.Number,
    wins: Schema.Number,
})

export const Ranking1v1RowSchema = Schema.Struct({
    ...RankedRowSchema.fields,
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
    best_legend: Schema.NullOr(BestLegendSchema),
})

export const Ranking2v2RowSchema = Schema.Struct({
    ...RankedRowSchema.fields,
    team: Schema.Tuple([PlayerRefSchema, PlayerRefSchema]),
})

export const Ranking3v3RowSchema = Schema.Struct({
    ...RankedRowSchema.fields,
    id: Schema.Number,
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

/**
 * One row of the archive-backed career boards.
 *
 * These are ours, not upstream: the crawler materialises a row per player (and
 * per legend, and per weapon) and the board sorts on one of its columns. That
 * is why the same shape serves all three — the filter and the sorted column are
 * query parameters, not fields.
 */
export const CareerRankingSchema = Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    slug: Schema.String,
    tier: Schema.String,
    rating: Schema.Number,
    region: Schema.String,
    peakRating: Schema.Number,
    /** The value of whichever column the request sorted by. */
    prop: Schema.Number,
})

export type CareerRanking = typeof CareerRankingSchema.Type

/**
 * A career-board row before the HTTP layer adds its URL segment.
 *
 * As with the lookup rows, the archive builds the data and has no business
 * knowing what a profile URL looks like. See `LookupResultInput`.
 */
export type CareerRankingInput = Omit<CareerRanking, "slug">

export const CareerRankingsSchema = Schema.Array(CareerRankingSchema)

/**
 * One ladder entry the activity sampler saw queue.
 *
 * An entry rather than a player, because the ladders differ: a 1v1 or 3v3 row
 * is one player and a 2v2 row is a team. `members` is where that shows, and it
 * is always a list so the renderer does not branch.
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
    rating: Schema.Number,
    peakRating: Schema.Number,
    tier: Schema.String,
    games: Schema.Number,
    wins: Schema.Number,
    /** Epoch milliseconds; only ever compared against "now". */
    queuedAt: Schema.Number,
    rank: Schema.Number,
    ratingDelta: Schema.Number,
    rankDelta: Schema.Number,
})

export type QueuedEntry = typeof QueuedEntrySchema.Type

export const RankedQueueSchema = Schema.Array(QueuedEntrySchema)

/** One row of the clan leaderboard, straight off the `BHClan` table. */
export const ClanRankingSchema = Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    slug: Schema.String,
    nameLower: Schema.String,
    created: Schema.NullOr(Schema.Number),
    xp: Schema.Number,
})

export type ClanRanking = typeof ClanRankingSchema.Type

export const ClansSchema = Schema.Array(ClanRankingSchema)

/** One legend's participation totals in a weekly rotation. */
export const LegendSchema = Schema.Struct({
    legend_id: Schema.Number,
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
