import { Schema } from "effect"
import { PlayerRefSchema, TierSchema, envelope } from "./common"

/**
 * The player profile page, in one payload.
 *
 * This is `kubi`'s `GET /players/:id` shape, adapted to what Brawlhalla v1 and
 * the legacy v0 API actually expose. The page used to cost four requests —
 * career stats, ranked (v0), 3v3 ranked (v1) and our alias index — and then did
 * the legend/weapon roll-up in the browser. All of that is computed here, so
 * the client renders and does not aggregate.
 *
 * ## What came from kubi, and what changed
 *
 * - Kept: the `{ data, meta }` envelope, `snake_case` fields, `id`/`name`/`slug`
 *   identity, aggregated `weapons` and `legends`, the `unarmed` / `gadgets` /
 *   `weapon_throws` breakdowns, and the season `glory` block.
 * - Added: `"3v3"` in place of kubi's `rotating`, because corehalla reads 3v3
 *   from v1 (`mode=ranked_3v3`) and has no rotating-queue payload.
 * - Changed: kubi's 2v2 `teams[].teammate` is a `team` tuple here. A corehalla
 *   team card shows *both* players, and the partner is only the "other" one
 *   relative to whoever is looking — the same row renders differently from each
 *   member's profile. Sending the pair makes that a rendering decision rather
 *   than something the server guesses.
 * - Changed: a 2v2 row carries `paired`, because v0 files a solo queue in the
 *   same list as a real team. The server knows the difference (a zero second
 *   id); making the client re-derive it is how the old code got it wrong.
 * - Dropped: kubi's `bookmark`, which is a per-user concept corehalla serves
 *   from `/api/v1/me/favorites` instead of embedding in a public payload.
 */

/** One gadget's damage and KOs. */
const PlayerGadgetSchema = Schema.Struct({
    damage_dealt: Schema.Number,
    kos: Schema.Number,
})

/** A legend's share of one of the player's weapons. */
const PlayerWeaponLegendSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
    kos: Schema.Number,
    damage_dealt: Schema.Number,
    time_held: Schema.Number,
})

/**
 * One wielded weapon, rolled up across every legend that uses it.
 *
 * A weapon is not something the API reports on directly — it is a projection of
 * the legends that hold it — so this is derived, and `legends` is the list it
 * was derived from. The old client built exactly this from the raw legend
 * tables; doing it once on the server is the point of the endpoint.
 */
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

/** One of a legend's two weapon slots. */
const PlayerLegendWeaponSchema = Schema.Struct({
    name: Schema.String,
    damage_dealt: Schema.Number,
    kos: Schema.Number,
    time_held: Schema.Number,
})

/** The career figures for a single legend. */
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

/** The player's ranked record for one legend, when they have one. */
const PlayerLegendRankedSchema = Schema.Struct({
    rating: Schema.Number,
    peak_rating: Schema.Number,
    tier: TierSchema,
    wins: Schema.Number,
    games: Schema.Number,
    /** Elo after a season reset. See `aggregate/season.ts`. */
    rating_reset: Schema.Number,
})

/**
 * One legend on the account, played or not.
 *
 * Every legend in the roster appears, with a zeroed `stats` block when the
 * player has never used them — that is what makes the legends tab a complete
 * table rather than a list of whoever happens to be in the payload.
 */
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

/** A 1v1 or 3v3 ranked record: one player, one rating. */
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

/** One 2v2 team the player queued with. */
const PlayerRankedTeamSchema = Schema.Struct({
    /** Both players, so the card can render either profile's view of the pair. */
    team: Schema.Tuple([PlayerRefSchema, PlayerRefSchema]),
    /**
     * False for a solo queue, where v0 files the player beside a zero-id
     * phantom partner. The pair is still a tuple so the row shape never varies.
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

/** The 2v2 season: every team, plus the totals across them. */
const PlayerRanked2v2Schema = Schema.Struct({
    games: Schema.Number,
    wins: Schema.Number,
    average_rating: Schema.Number,
    average_peak_rating: Schema.Number,
    teams: Schema.Array(PlayerRankedTeamSchema),
})

/** The season-wide block kubi calls `ranked.stats`. */
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
 * The ranked half of the profile.
 *
 * Null when the player has no ranked data at all. Individual brackets are null
 * when that bracket has no games — a payload existing is not the same as a
 * record, and the client should not have to check `games > 0` to know whether
 * to render a card.
 */
const PlayerRankedSchema = Schema.Struct({
    stats: PlayerRankedSeasonSchema,
    "1v1": Schema.NullOr(PlayerRankedBracketSchema),
    "2v2": Schema.NullOr(PlayerRanked2v2Schema),
    "3v3": Schema.NullOr(PlayerRankedBracketSchema),
})

/** The account's clan membership, as the profile card shows it. */
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

/** The career figures, summed across every legend. */
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
    /** Former names, most recently first seen, with the current name excluded. */
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
    /**
     * Weapon-derived KO figures, precomputed because v1 does not report
     * thrown-item KOs at all.
     *
     * `thrown_kos` is the remainder of `stats.kos` once the four reported
     * sources are subtracted, so the client does not have to know that rule to
     * draw an honest breakdown.
     */
    weapon_kos: Schema.Number,
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
