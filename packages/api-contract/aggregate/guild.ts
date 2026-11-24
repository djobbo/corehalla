import { Schema } from "effect"
import { sectionEnvelope } from "./section"

const GuildMemberSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
    rank: Schema.String,
    joined_at: Schema.Number,
    xp: Schema.Number,
    /**
     * Optional: only v1 reports guild-battle points. Absent ≠ a real zero,
     * which active guilds can genuinely have.
     */
    guild_points: Schema.optionalKey(Schema.Number),
})

const GuildStandingSchema = Schema.Struct({
    /**
     * One plus the indexed guilds with more XP, so ties share the higher
     * position. Null when the archive has never indexed this guild.
     */
    rank: Schema.NullOr(Schema.Number),
    /** Indexed guilds the rank is measured against; null when unread. */
    total: Schema.NullOr(Schema.Number),
})

export const GuildSchema = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
    slug: Schema.String,
    created_at: Schema.Number,
    xp: Schema.Number,
    /** 1-based on Brawlhalla's guild curve. */
    level: Schema.Number,
    /** Progress through the current level, 0–100; `100` at the cap. */
    xp_percentage: Schema.Number,
    /**
     * Null when no source reported it (v0 has none). `0` would claim the guild
     * earned nothing rather than that we do not know.
     */
    lifetime_xp: Schema.NullOr(Schema.Number),
    /**
     * Null when unreported. Not the roster sum — a clan keeps points of everyone
     * who ever contributed.
     */
    guild_points: Schema.NullOr(Schema.Number),
    /** Archive standing by XP; independent of the live clan payload. */
    standing: GuildStandingSchema,
    members: Schema.Array(GuildMemberSchema),
})

export type Guild = typeof GuildSchema.Type
export type GuildMember = typeof GuildMemberSchema.Type
export type GuildStanding = typeof GuildStandingSchema.Type

export const GuildEnvelopeSchema = sectionEnvelope(GuildSchema)

export type GuildEnvelope = typeof GuildEnvelopeSchema.Type
