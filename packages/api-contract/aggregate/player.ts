import { Schema } from "effect"
import { PlayerRefSchema, TierSchema, envelope } from "./common"
import { sectionEnvelope } from "./section"

export const PlayerGadgetSchema = Schema.Struct({
    damage_dealt: Schema.Number,
    kos: Schema.Number,
})

export const PlayerWeaponLegendSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
    kos: Schema.Number,
    damage_dealt: Schema.Number,
    time_held: Schema.Number,
})

/** Derived from legends that hold the weapon — not reported by the API. */
export const PlayerWeaponSchema = Schema.Struct({
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

export const PlayerLegendWeaponSchema = Schema.Struct({
    name: Schema.String,
    damage_dealt: Schema.Number,
    kos: Schema.Number,
    time_held: Schema.Number,
})

export const PlayerLegendStatsSchema = Schema.Struct({
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

export const PlayerLegendRankedSchema = Schema.Struct({
    rating: Schema.Number,
    peak_rating: Schema.Number,
    tier: TierSchema,
    wins: Schema.Number,
    games: Schema.Number,
    rating_reset: Schema.Number,
})

/** Every roster legend appears; unused ones get a zeroed `stats` block. */
export const PlayerLegendSchema = Schema.Struct({
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

export const PlayerRankedBracketSchema = Schema.Struct({
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

export const PlayerRankedTeamSchema = Schema.Struct({
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

export const PlayerRanked2v2Schema = Schema.Struct({
    games: Schema.Number,
    wins: Schema.Number,
    average_rating: Schema.Number,
    average_peak_rating: Schema.Number,
    teams: Schema.Array(PlayerRankedTeamSchema),
})

export const PlayerRankedSeasonSchema = Schema.Struct({
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
export const PlayerRankedSchema = Schema.Struct({
    stats: PlayerRankedSeasonSchema,
    "1v1": Schema.NullOr(PlayerRankedBracketSchema),
    "2v2": Schema.NullOr(PlayerRanked2v2Schema),
    "3v3": Schema.NullOr(PlayerRankedBracketSchema),
})

export const PlayerClanSchema = Schema.Struct({
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

export const PlayerStatsSchema = Schema.Struct({
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

export const PlayerUnarmedSchema = Schema.Struct({
    damage_dealt: Schema.Number,
    kos: Schema.Number,
    time_held: Schema.Number,
})

export const PlayerGadgetsSchema = Schema.Struct({
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
})

/** Everything the overview bubble charts need, without the per-legend rows. */
export const LegendBubbleSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    name_key: Schema.String,
    slug: Schema.String,
    level: Schema.Number,
    matchtime: Schema.Number,
    kos: Schema.Number,
    damage_dealt: Schema.Number,
    games: Schema.Number,
    wins: Schema.Number,
})

/** Everything the weapon bubble chart needs, without the legend lists. */
export const WeaponBubbleSchema = Schema.Struct({
    name: Schema.String,
    level: Schema.Number,
    time_held: Schema.Number,
    kos: Schema.Number,
    damage_dealt: Schema.Number,
    games: Schema.Number,
    wins: Schema.Number,
})

/**
 * The header + overview payload. `ranked.2v2.teams` is always empty here; the
 * lazy teams section owns the list. `has_2v2` / `solo_2v2` carry the two facts
 * the overview needs.
 */
export const PlayerProfileSchema = Schema.Struct({
    id: Schema.Number,
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
    weapon_kos: Schema.Number,
    /**
     * Remainder of `stats.kos` after reported sources; v1 does not report
     * thrown-item KOs.
     */
    thrown_kos: Schema.Number,
    weapon_damage: Schema.Number,
})

/** The composed view used by stories and the client merge facade. */
export const PlayerSchema = Schema.Struct({
    id: Schema.Number,
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
    weapon_kos: Schema.Number,
    thrown_kos: Schema.Number,
    weapon_damage: Schema.Number,
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
