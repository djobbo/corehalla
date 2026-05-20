import { Schema } from "effect"

import { BrawlhallaId, BrawlhallaName } from "./brawlhalla-id.js"
import { BrawlhallaApiRegion } from "./region.js"
import { BrawlhallaApiTier } from "./tier.js"

const Ranking = Schema.Struct({
    rank: Schema.Number,
    rating: Schema.Number,
    tier: BrawlhallaApiTier,
    games: Schema.Number,
    wins: Schema.Number,
    region: BrawlhallaApiRegion,
    peak_rating: Schema.Number,
})

export const Ranking1v1 = Schema.Struct({
    ...Ranking.fields,
    name: BrawlhallaName,
    brawlhalla_id: BrawlhallaId,
    best_legend: Schema.Number,
    best_legend_games: Schema.Number,
    best_legend_wins: Schema.Number,
    twitch_name: Schema.optionalKey(Schema.String),
})

export const Rankings1v1 = Schema.Array(Ranking1v1)

export const Ranking2v2 = Schema.Struct({
    ...Ranking.fields,
    teamname: BrawlhallaName,
    brawlhalla_id_one: BrawlhallaId,
    brawlhalla_id_two: BrawlhallaId,
    twitch_name_one: Schema.optionalKey(Schema.String),
    twitch_name_two: Schema.optionalKey(Schema.String),
})

export const Rankings2v2 = Schema.Array(Ranking2v2)

export const RankingRotating = Schema.Struct({
    ...Ranking.fields,
    name: BrawlhallaName,
    brawlhalla_id: BrawlhallaId,
})

export const RankingsRotating = Schema.Array(RankingRotating)

export type Ranking1v1 = typeof Ranking1v1.Type
export type Ranking2v2 = typeof Ranking2v2.Type
export type RankingRotating = typeof RankingRotating.Type
