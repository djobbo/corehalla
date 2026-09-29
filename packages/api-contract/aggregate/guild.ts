import { Schema } from "effect"
import { envelope } from "./common"

/**
 * The guild page, in one payload.
 *
 * `kubi`'s `GET /guilds/:id` shape. The two upstream calls it needs —
 * `/guild/stats` and `/guild/members` — already collapse to one `Clan` in the
 * gateway, so what this adds over the raw endpoint is the derived half the page
 * renders: the guild's level and progress toward the next one, and each
 * member's URL segment.
 *
 * The level curve is Brawlhalla's own (`guildLevels` in
 * `aggregate/guild-levels.ts`), taken from kubi. It is presentation math over a
 * number the API does send, not a field the API omits.
 */

/** One member of the roster. */
const GuildMemberSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
    rank: Schema.String,
    joined_at: Schema.Number,
    /** The member's clan XP — their share of the clan's level progress. */
    xp: Schema.Number,
    /**
     * Guild-battle points.
     *
     * Optional because only v1 reports them: the legacy `/clan/:id` payload has
     * no such field, and "this source does not say" is not the same as a real
     * zero, which plenty of active guilds genuinely have.
     */
    guild_points: Schema.optionalKey(Schema.Number),
})

export const GuildSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
    created_at: Schema.Number,
    xp: Schema.Number,
    /** 1-based level on Brawlhalla's guild curve. */
    level: Schema.Number,
    /** Progress through the current level, 0-100. `100` at the cap. */
    xp_percentage: Schema.Number,
    /**
     * Total XP ever earned, including members no longer in the roster.
     *
     * Null when no source reported it: only v1's `/guild/stats` carries a
     * legacy total, so a v0-served guild has none, and `0` would claim the
     * guild earned nothing rather than that we do not know.
     */
    lifetime_xp: Schema.NullOr(Schema.Number),
    /**
     * The guild's own battle-point total.
     *
     * Null when no source reported it. It is deliberately *not* the roster sum:
     * a clan keeps the points of everyone who has ever contributed, so summing
     * the current members understates it.
     */
    guild_points: Schema.NullOr(Schema.Number),
    members: Schema.Array(GuildMemberSchema),
})

export type Guild = typeof GuildSchema.Type
export type GuildMember = typeof GuildMemberSchema.Type

export const GuildEnvelopeSchema = envelope(GuildSchema)

export type GuildEnvelope = typeof GuildEnvelopeSchema.Type
