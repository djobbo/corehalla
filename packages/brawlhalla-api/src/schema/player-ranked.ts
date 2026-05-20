import { Schema, SchemaTransformation } from "effect"

import { BrawlhallaId, BrawlhallaName } from "./brawlhalla-id.js"
import { BrawlhallaApiRegion } from "./region.js"
import { BrawlhallaApiTier } from "./tier.js"

const PlayerRankedLegend = Schema.Struct({
    legend_id: Schema.Number,
    legend_name_key: Schema.String,
    rating: Schema.Number,
    peak_rating: Schema.Number,
    tier: BrawlhallaApiTier,
    wins: Schema.Number,
    games: Schema.Number,
})

const PlayerRanked2v2Team = Schema.Struct({
    brawlhalla_id_one: BrawlhallaId,
    brawlhalla_id_two: BrawlhallaId,
    rating: Schema.Number,
    peak_rating: Schema.Number,
    tier: BrawlhallaApiTier,
    wins: Schema.Number,
    games: Schema.Number,
    teamname: BrawlhallaName,
    region: Schema.Number,
    global_rank: Schema.Number,
})

const RotatingRanked = Schema.Struct({
    name: BrawlhallaName,
    brawlhalla_id: BrawlhallaId,
    rating: Schema.Number,
    peak_rating: Schema.Number,
    tier: BrawlhallaApiTier,
    wins: Schema.Number,
    games: Schema.Number,
    region: BrawlhallaApiRegion,
})

/** API returns `[]` when unplayed, or a stats object when the player has games. */
const RotatingRankedWire = Schema.Union([
    Schema.Array(Schema.Never),
    RotatingRanked,
])

const decodeRotatingRanked = (input: typeof RotatingRankedWire.Type) => {
    if ("name" in input) {
        return input
    }

    return null
}

const encodeRotatingRanked = (input: typeof RotatingRanked.Type | null) => {
    if (input === null) {
        return [] as readonly never[]
    }

    return input
}

// Wire shape is `[] | stats`; decode normalizes `[]` to `null`.
const ApiRotatingRanked = RotatingRankedWire.pipe(
    Schema.decodeTo(
        Schema.NullOr(RotatingRanked),
        SchemaTransformation.transform({
            decode: decodeRotatingRanked,
            encode: encodeRotatingRanked,
        }) as never,
    ),
)

export const PlayerRanked = Schema.Struct({
    name: BrawlhallaName,
    brawlhalla_id: BrawlhallaId,
    global_rank: Schema.Number,
    region_rank: Schema.Number,
    legends: Schema.Array(PlayerRankedLegend),
    "2v2": Schema.Array(PlayerRanked2v2Team),
    rating: Schema.Number,
    peak_rating: Schema.Number,
    tier: BrawlhallaApiTier,
    wins: Schema.Number,
    games: Schema.Number,
    region: BrawlhallaApiRegion,
    rotating_ranked: ApiRotatingRanked,
})

export type PlayerRanked = typeof PlayerRanked.Type
