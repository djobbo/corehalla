import { Schema } from "effect"
import { envelope } from "./common"

/**
 * Brawlhalla esports data for a player, sourced from brawltools and keyed by
 * the Brawlhalla id the rest of the site uses. The esports `playerId` is an
 * internal detail; identity/platform IDs and socials are surfaced instead.
 */

export const EsportsIdentitySchema = Schema.Struct({
    esportsId: Schema.Number,
    fullName: Schema.NullOr(Schema.String),
    pronoun: Schema.NullOr(Schema.String),
    sggPlayerId: Schema.NullOr(Schema.Number),
    cmPlayerId: Schema.NullOr(Schema.String),
    twitter: Schema.NullOr(Schema.String),
    twitch: Schema.NullOr(Schema.String),
    country: Schema.NullOr(Schema.String),
})

export const EsportsPrSchema = Schema.Struct({
    top8: Schema.Number,
    top32: Schema.Number,
    gold: Schema.Number,
    silver: Schema.Number,
    bronze: Schema.Number,
    powerRanking: Schema.Number,
    region: Schema.String,
})

export const EsportsLegendSchema = Schema.Struct({
    name: Schema.String,
    count: Schema.Number,
})

export const EsportsTeammateSchema = Schema.Struct({
    brawlhallaId: Schema.NullOr(Schema.Number),
    name: Schema.String,
    /** Player-stats slug; null when the teammate's Brawlhalla id is unknown. */
    slug: Schema.NullOr(Schema.String),
    games: Schema.Number,
    lastTeamedDate: Schema.Number,
})

export const EsportsPlacementSchema = Schema.Struct({
    placement: Schema.Number,
    tournamentId: Schema.String,
    tournamentName: Schema.String,
    eventName: Schema.NullOr(Schema.String),
    year: Schema.Number,
    isOfficial: Schema.Boolean,
    isTwos: Schema.Boolean,
    isOnline: Schema.Boolean,
    startTime: Schema.Number,
    host: Schema.NullOr(Schema.String),
})

export const PlayerEsportsSchema = Schema.Struct({
    /** Null when brawltools has no esports record for this Brawlhalla id. */
    identity: Schema.NullOr(EsportsIdentitySchema),
    pr: Schema.Struct({
        "1v1": Schema.NullOr(EsportsPrSchema),
        "2v2": Schema.NullOr(EsportsPrSchema),
    }),
    recentLegend: Schema.NullOr(EsportsLegendSchema),
    teammates: Schema.Array(EsportsTeammateSchema),
    /** Most recent tournament placements per bracket, newest first. */
    placements: Schema.Struct({
        "1v1": Schema.Array(EsportsPlacementSchema),
        "2v2": Schema.Array(EsportsPlacementSchema),
    }),
})

export type PlayerEsports = typeof PlayerEsportsSchema.Type
export type EsportsIdentity = typeof EsportsIdentitySchema.Type
export type EsportsPr = typeof EsportsPrSchema.Type
export type EsportsTeammate = typeof EsportsTeammateSchema.Type
export type EsportsPlacement = typeof EsportsPlacementSchema.Type

export const PlayerEsportsEnvelopeSchema = envelope(PlayerEsportsSchema)

export type PlayerEsportsEnvelope = typeof PlayerEsportsEnvelopeSchema.Type
