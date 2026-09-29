import { Schema } from "effect"
import { PlayerRefSchema, TierSchema, envelope } from "./common"

const PlayerGadgetSchema = Schema.Struct({
    damage_dealt: Schema.Number,
    kos: Schema.Number,
})

const PlayerWeaponLegendSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
    kos: Schema.Number,
    damage_dealt: Schema.Number,
    time_held: Schema.Number,
})

/** Derived from legends that hold the weapon — not reported by the API. */
const PlayerWeaponSchema = Schema.Struct({
    name: Schema.String,
    stats: Schema.Struct({
        games: Schema.Number,
        wins: Schema.Number,
        kos: Schema.Number,
        damage_dealt: Schema.Number,
        time_held: Schema.Number,
        level: Schema.Number,
        xp: Schema.Number,
    }),
    legends: Schema.Array(PlayerWeaponLegendSchema),
})

const PlayerLegendWeaponSchema = Schema.Struct({
    name: Schema.String,
    damage_dealt: Schema.Number,
    kos: Schema.Number,
    time_held: Schema.Number,
})

const PlayerLegendStatsSchema = Schema.Struct({
    xp: Schema.Number,
    level: Schema.Number,
    xp_percentage: Schema.Number,
    damage_dealt: Schema.Number,
    damage_taken: Schema.Number,
    kos: Schema.Number,
    falls: Schema.Number,
    suicides: Schema.Number,
    team_kos: Schema.Number,
    matchtime: Schema.Number,
    games: Schema.Number,
    wins: Schema.Number,
})

const PlayerLegendRankedSchema = Schema.Struct({
    rating: Schema.Number,
    peak_rating: Schema.Number,
    tier: TierSchema,
    wins: Schema.Number,
    games: Schema.Number,
    rating_reset: Schema.Number,
})

/** Every roster legend appears; unused ones get a zeroed `stats` block. */
const PlayerLegendSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    name_key: Schema.String,
    slug: Schema.String,
    stats: PlayerLegendStatsSchema,
    weapon_one: PlayerLegendWeaponSchema,
    weapon_two: PlayerLegendWeaponSchema,
    unarmed: Schema.Struct({
        damage_dealt: Schema.Number,
        kos: Schema.Number,
        time_held: Schema.Number,
    }),
    gadgets: PlayerGadgetSchema,
    weapon_throws: PlayerGadgetSchema,
    ranked: Schema.NullOr(PlayerLegendRankedSchema),
})

const PlayerRankedBracketSchema = Schema.Struct({
    rating: Schema.Number,
    peak_rating: Schema.Number,
    /** True while placement matches hide the real rating. */
    is_placement_matches: Schema.Boolean,
    tier: TierSchema,
    wins: Schema.Number,
    games: Schema.Number,
    region: Schema.NullOr(Schema.String),
    rating_reset: Schema.Number,
})

const PlayerRankedTeamSchema = Schema.Struct({
    team: Schema.Tuple([PlayerRefSchema, PlayerRefSchema]),
    /**
     * False for a solo queue beside a zero-id phantom partner; the pair stays a
     * tuple so the row shape never varies.
     */
    paired: Schema.Boolean,
    rating: Schema.Number,
    peak_rating: Schema.Number,
    tier: TierSchema,
    wins: Schema.Number,
    games: Schema.Number,
    region: Schema.NullOr(Schema.String),
    rating_reset: Schema.Number,
})

const PlayerRanked2v2Schema = Schema.Struct({
    games: Schema.Number,
    wins: Schema.Number,
    average_rating: Schema.Number,
    average_peak_rating: Schema.Number,
    teams: Schema.Array(PlayerRankedTeamSchema),
})

const PlayerRankedSeasonSchema = Schema.Struct({
    games: Schema.Number,
    wins: Schema.Number,
    peak_rating: Schema.Number,
    glory: Schema.Struct({
        from_wins: Schema.Number,
        from_peak_rating: Schema.Number,
        total: Schema.Number,
    }),
})

/**
 * Null when the player has no ranked data. Individual brackets are null when
 * that bracket has no games — do not infer from `games > 0`.
 */
const PlayerRankedSchema = Schema.Struct({
    stats: PlayerRankedSeasonSchema,
    "1v1": Schema.NullOr(PlayerRankedBracketSchema),
    "2v2": Schema.NullOr(PlayerRanked2v2Schema),
    "3v3": Schema.NullOr(PlayerRankedBracketSchema),
})

const PlayerClanSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
    xp: Schema.Number,
    personal_xp: Schema.Number,
    rank: Schema.NullOr(Schema.String),
    joined_at: Schema.NullOr(Schema.Number),
    created_at: Schema.NullOr(Schema.Number),
    members_count: Schema.NullOr(Schema.Number),
})

const PlayerStatsSchema = Schema.Struct({
    xp: Schema.Number,
    level: Schema.Number,
    xp_percentage: Schema.Number,
    games: Schema.Number,
    wins: Schema.Number,
    matchtime: Schema.Number,
    kos: Schema.Number,
    falls: Schema.Number,
    suicides: Schema.Number,
    team_kos: Schema.Number,
    damage_dealt: Schema.Number,
    damage_taken: Schema.Number,
})

export const PlayerSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
    /** Former names, most recently first seen; current name excluded. */
    aliases: Schema.Array(Schema.String),
    stats: PlayerStatsSchema,
    ranked: Schema.NullOr(PlayerRankedSchema),
    clan: Schema.NullOr(PlayerClanSchema),
    unarmed: Schema.Struct({
        damage_dealt: Schema.Number,
        kos: Schema.Number,
        time_held: Schema.Number,
    }),
    weapon_throws: PlayerGadgetSchema,
    gadgets: Schema.Struct({
        kos: Schema.Number,
        damage_dealt: Schema.Number,
        bomb: Schema.NullOr(PlayerGadgetSchema),
        mine: Schema.NullOr(PlayerGadgetSchema),
        spikeball: Schema.NullOr(PlayerGadgetSchema),
        sidekick: Schema.NullOr(PlayerGadgetSchema),
        snowball: Schema.NullOr(
            Schema.Struct({
                hits: Schema.Number,
                kos: Schema.Number,
            }),
        ),
    }),
    weapons: Schema.Array(PlayerWeaponSchema),
    legends: Schema.Array(PlayerLegendSchema),
    weapon_kos: Schema.Number,
    /**
     * Remainder of `stats.kos` after reported sources; v1 does not report
     * thrown-item KOs.
     */
    thrown_kos: Schema.Number,
    weapon_damage: Schema.Number,
})

export type Player = typeof PlayerSchema.Type
export type PlayerLegend = typeof PlayerLegendSchema.Type
export type PlayerWeapon = typeof PlayerWeaponSchema.Type
export type PlayerRanked = typeof PlayerRankedSchema.Type
export type PlayerRankedTeam = typeof PlayerRankedTeamSchema.Type

export const PlayerEnvelopeSchema = envelope(PlayerSchema)

export type PlayerEnvelope = typeof PlayerEnvelopeSchema.Type
