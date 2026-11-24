import { Schema } from "effect"
import { PlayerRefSchema, TierSchema, envelope } from "./common"
import { sectionEnvelope } from "./section"

export const PlayerGadgetSchema = Schema.Struct({
    damage_dealt: Schema.Finite,
    kos: Schema.Finite,
})

export const PlayerWeaponLegendSchema = Schema.Struct({
    id: Schema.Finite,
    name: Schema.String,
    slug: Schema.String,
    kos: Schema.Finite,
    damage_dealt: Schema.Finite,
    time_held: Schema.Finite,
})

/** Derived from legends that hold the weapon — not reported by the API. */
export const PlayerWeaponSchema = Schema.Struct({
    name: Schema.String,
    stats: Schema.Struct({
        games: Schema.Finite,
        wins: Schema.Finite,
        kos: Schema.Finite,
        damage_dealt: Schema.Finite,
        time_held: Schema.Finite,
        level: Schema.Finite,
        xp: Schema.Finite,
    }),
    legends: Schema.Array(PlayerWeaponLegendSchema),
})

export const PlayerLegendWeaponSchema = Schema.Struct({
    name: Schema.String,
    damage_dealt: Schema.Finite,
    kos: Schema.Finite,
    time_held: Schema.Finite,
})

export const PlayerLegendStatsSchema = Schema.Struct({
    xp: Schema.Finite,
    level: Schema.Finite,
    xp_percentage: Schema.Finite,
    damage_dealt: Schema.Finite,
    damage_taken: Schema.Finite,
    kos: Schema.Finite,
    falls: Schema.Finite,
    suicides: Schema.Finite,
    team_kos: Schema.Finite,
    matchtime: Schema.Finite,
    games: Schema.Finite,
    wins: Schema.Finite,
})

export const PlayerLegendRankedSchema = Schema.Struct({
    rating: Schema.Finite,
    peak_rating: Schema.Finite,
    tier: TierSchema,
    wins: Schema.Finite,
    games: Schema.Finite,
    rating_reset: Schema.Finite,
})

/** Every roster legend appears; unused ones get a zeroed `stats` block. */
export const PlayerLegendSchema = Schema.Struct({
    id: Schema.Finite,
    name: Schema.String,
    name_key: Schema.String,
    slug: Schema.String,
    stats: PlayerLegendStatsSchema,
    weapon_one: PlayerLegendWeaponSchema,
    weapon_two: PlayerLegendWeaponSchema,
    unarmed: Schema.Struct({
        damage_dealt: Schema.Finite,
        kos: Schema.Finite,
        time_held: Schema.Finite,
    }),
    gadgets: PlayerGadgetSchema,
    weapon_throws: PlayerGadgetSchema,
    ranked: Schema.NullOr(PlayerLegendRankedSchema),
})

export const PlayerRankedBracketSchema = Schema.Struct({
    rating: Schema.Finite,
    peak_rating: Schema.Finite,
    /** True while placement matches hide the real rating. */
    is_placement_matches: Schema.Boolean,
    tier: TierSchema,
    wins: Schema.Finite,
    games: Schema.Finite,
    region: Schema.NullOr(Schema.String),
    /** Ladder position, null when upstream reports zero or does not report it. */
    global_rank: Schema.NullOr(Schema.Finite),
    region_rank: Schema.NullOr(Schema.Finite),
    rating_reset: Schema.Finite,
})

export const PlayerRankedTeamSchema = Schema.Struct({
    team: Schema.Tuple([PlayerRefSchema, PlayerRefSchema]),
    /**
     * False for a solo queue beside a zero-id phantom partner; the pair stays a
     * tuple so the row shape never varies.
     */
    paired: Schema.Boolean,
    rating: Schema.Finite,
    peak_rating: Schema.Finite,
    tier: TierSchema,
    wins: Schema.Finite,
    games: Schema.Finite,
    region: Schema.NullOr(Schema.String),
    global_rank: Schema.NullOr(Schema.Finite),
    rating_reset: Schema.Finite,
})

export const PlayerRanked2v2Schema = Schema.Struct({
    games: Schema.Finite,
    wins: Schema.Finite,
    average_rating: Schema.Finite,
    average_peak_rating: Schema.Finite,
    teams: Schema.Array(PlayerRankedTeamSchema),
})

export const PlayerRankedSeasonSchema = Schema.Struct({
    games: Schema.Finite,
    wins: Schema.Finite,
    peak_rating: Schema.Finite,
    glory: Schema.Struct({
        from_wins: Schema.Finite,
        from_peak_rating: Schema.Finite,
        total: Schema.Finite,
    }),
})

/**
 * Null when the player has no ranked data. Individual brackets are null when
 * that bracket has no games — do not infer from `games > 0`.
 */
export const PlayerRankedSchema = Schema.Struct({
    stats: PlayerRankedSeasonSchema,
    "1v1": Schema.NullOr(PlayerRankedBracketSchema),
    "2v2": Schema.NullOr(PlayerRanked2v2Schema),
    "3v3": Schema.NullOr(PlayerRankedBracketSchema),
})

export const PlayerClanSchema = Schema.Struct({
    id: Schema.Finite,
    name: Schema.String,
    slug: Schema.String,
    xp: Schema.Finite,
    personal_xp: Schema.Finite,
    rank: Schema.NullOr(Schema.String),
    joined_at: Schema.NullOr(Schema.Finite),
    created_at: Schema.NullOr(Schema.Finite),
    members_count: Schema.NullOr(Schema.Finite),
})

export const PlayerStatsSchema = Schema.Struct({
    xp: Schema.Finite,
    level: Schema.Finite,
    xp_percentage: Schema.Finite,
    games: Schema.Finite,
    wins: Schema.Finite,
    matchtime: Schema.Finite,
    kos: Schema.Finite,
    falls: Schema.Finite,
    suicides: Schema.Finite,
    team_kos: Schema.Finite,
    damage_dealt: Schema.Finite,
    damage_taken: Schema.Finite,
})

export const PlayerUnarmedSchema = Schema.Struct({
    damage_dealt: Schema.Finite,
    kos: Schema.Finite,
    time_held: Schema.Finite,
})

export const PlayerGadgetsSchema = Schema.Struct({
    kos: Schema.Finite,
    damage_dealt: Schema.Finite,
    bomb: Schema.NullOr(PlayerGadgetSchema),
    mine: Schema.NullOr(PlayerGadgetSchema),
    spikeball: Schema.NullOr(PlayerGadgetSchema),
    sidekick: Schema.NullOr(PlayerGadgetSchema),
    snowball: Schema.NullOr(
        Schema.Struct({
            hits: Schema.Finite,
            kos: Schema.Finite,
        }),
    ),
})

/** Everything the overview bubble charts need, without the per-legend rows. */
export const LegendBubbleSchema = Schema.Struct({
    id: Schema.Finite,
    name: Schema.String,
    name_key: Schema.String,
    slug: Schema.String,
    level: Schema.Finite,
    matchtime: Schema.Finite,
    kos: Schema.Finite,
    damage_dealt: Schema.Finite,
    games: Schema.Finite,
    wins: Schema.Finite,
})

/** Everything the weapon bubble chart needs, without the legend lists. */
export const WeaponBubbleSchema = Schema.Struct({
    name: Schema.String,
    level: Schema.Finite,
    time_held: Schema.Finite,
    kos: Schema.Finite,
    damage_dealt: Schema.Finite,
    games: Schema.Finite,
    wins: Schema.Finite,
})

/**
 * Where a 1v1 rating sits among the ranked players Corehalla has indexed.
 * Ties share a rank, so the count never inflates.
 */
export const PlayerStandingSchema = Schema.Struct({
    /** One plus the indexed ranked players with a strictly higher rating. */
    rank: Schema.Finite,
    /** Indexed players with at least one ranked game. */
    sample_size: Schema.Finite,
    /** `rank` as a share of the sample, one decimal, floored at 0.1. */
    top_percent: Schema.Finite,
})

/**
 * The header + overview payload. `ranked.2v2.teams` is always empty here; the
 * lazy teams section owns the list. `has_2v2` / `solo_2v2` carry the two facts
 * the overview needs.
 */
export const PlayerProfileSchema = Schema.Struct({
    id: Schema.Finite,
    name: Schema.String,
    slug: Schema.String,
    /** Former names, most recently first seen; current name excluded. */
    aliases: Schema.Array(Schema.String),
    stats: PlayerStatsSchema,
    ranked: Schema.NullOr(PlayerRankedSchema),
    unarmed: PlayerUnarmedSchema,
    weapon_throws: PlayerGadgetSchema,
    gadgets: PlayerGadgetsSchema,
    legend_bubbles: Schema.Array(LegendBubbleSchema),
    weapon_bubbles: Schema.Array(WeaponBubbleSchema),
    has_2v2: Schema.Boolean,
    solo_2v2: Schema.NullOr(PlayerRankedTeamSchema),
    /** Null when the archive has no ranked sample for this player. */
    standing: Schema.NullOr(PlayerStandingSchema),
    weapon_kos: Schema.Finite,
    /**
     * Remainder of `stats.kos` after reported sources; v1 does not report
     * thrown-item KOs.
     */
    thrown_kos: Schema.Finite,
    weapon_damage: Schema.Finite,
})

/** The composed view used by stories and the client merge facade. */
export const PlayerSchema = Schema.Struct({
    id: Schema.Finite,
    name: Schema.String,
    slug: Schema.String,
    aliases: Schema.Array(Schema.String),
    stats: PlayerStatsSchema,
    ranked: Schema.NullOr(PlayerRankedSchema),
    clan: Schema.NullOr(PlayerClanSchema),
    unarmed: PlayerUnarmedSchema,
    weapon_throws: PlayerGadgetSchema,
    gadgets: PlayerGadgetsSchema,
    weapons: Schema.Array(PlayerWeaponSchema),
    legends: Schema.Array(PlayerLegendSchema),
    weapon_kos: Schema.Finite,
    thrown_kos: Schema.Finite,
    weapon_damage: Schema.Finite,
})

export type Player = typeof PlayerSchema.Type
export type PlayerProfile = typeof PlayerProfileSchema.Type
export type PlayerLegend = typeof PlayerLegendSchema.Type
export type PlayerWeapon = typeof PlayerWeaponSchema.Type
export type PlayerRanked = typeof PlayerRankedSchema.Type
export type PlayerRankedTeam = typeof PlayerRankedTeamSchema.Type
export type PlayerRanked2v2 = typeof PlayerRanked2v2Schema.Type
export type PlayerClan = typeof PlayerClanSchema.Type
export type LegendBubble = typeof LegendBubbleSchema.Type
export type WeaponBubble = typeof WeaponBubbleSchema.Type
export type PlayerStanding = typeof PlayerStandingSchema.Type

export const PlayerEnvelopeSchema = envelope(PlayerSchema)

export type PlayerEnvelope = typeof PlayerEnvelopeSchema.Type

export const PlayerProfileEnvelopeSchema = sectionEnvelope(PlayerProfileSchema)
export type PlayerProfileEnvelope = typeof PlayerProfileEnvelopeSchema.Type

export const PlayerLegendsEnvelopeSchema = sectionEnvelope(
    Schema.Array(PlayerLegendSchema),
)
export type PlayerLegendsEnvelope = typeof PlayerLegendsEnvelopeSchema.Type

export const PlayerWeaponsEnvelopeSchema = sectionEnvelope(
    Schema.Array(PlayerWeaponSchema),
)
export type PlayerWeaponsEnvelope = typeof PlayerWeaponsEnvelopeSchema.Type

export const PlayerTeamsEnvelopeSchema = sectionEnvelope(PlayerRanked2v2Schema)
export type PlayerTeamsEnvelope = typeof PlayerTeamsEnvelopeSchema.Type

export const PlayerClanEnvelopeSchema = sectionEnvelope(
    Schema.NullOr(PlayerClanSchema),
)
export type PlayerClanEnvelope = typeof PlayerClanEnvelopeSchema.Type
