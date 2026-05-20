import { Schema } from "effect"

export const PowerRankingsPlayer = Schema.Struct({
    playerId: Schema.Number,
    playerName: Schema.String,
    twitter: Schema.optionalKey(Schema.String),
    twitch: Schema.optionalKey(Schema.String),
    top8: Schema.Number,
    top32: Schema.Number,
    gold: Schema.Number,
    silver: Schema.Number,
    bronze: Schema.Number,
    powerRanking: Schema.Number,
    points: Schema.Number,
    earnings: Schema.Number,
})

export const PowerRankingsResponse = Schema.Struct({
    prPlayers: Schema.Array(PowerRankingsPlayer),
    totalPages: Schema.Number,
    lastUpdated: Schema.String,
})

export type PowerRankingsPlayer = typeof PowerRankingsPlayer.Type
export type PowerRankingsResponse = typeof PowerRankingsResponse.Type
