import { Schema } from "effect"

/**
 * One row of the federated lookup.
 *
 * Players and clans share one list, so every row carries the discriminants the
 * UI needs to render a badge and a link (`type`, `id`, `slug`) plus whichever
 * prominence number applies to that type. Fields that do not apply are `null`
 * rather than absent, so a row's shape does not depend on its type.
 */
export const LookupResultSchema = Schema.Struct({
    type: Schema.Literals(["player", "clan"]),
    id: Schema.String,
    /** The name to display: current name for a player, name for a clan. */
    name: Schema.String,
    /** Canonical URL segment, so the client builds a link without re-deriving it. */
    slug: Schema.String,
    /**
     * Other names this player has played under.
     *
     * The rankings search only knows current names, so this is the only way a
     * renamed player is findable by an old name — it comes from the local alias
     * index.
     */
    aliases: Schema.Array(Schema.String),
    /** Current 1v1 rating. `null` for a clan, or for a player found only locally. */
    rating: Schema.NullOr(Schema.Number),
    /** Clan XP. `null` for a player. */
    xp: Schema.NullOr(Schema.Number),
    tier: Schema.NullOr(Schema.String),
    region: Schema.NullOr(Schema.String),
    /**
     * Which source produced the row.
     *
     * Kept on the wire so the rankings quality is observable: a lookup that
     * silently stopped reaching the upstream ladder would otherwise look like a
     * complete result set.
     */
    source: Schema.Literals(["rankings", "archive"]),
})

export type LookupResult = typeof LookupResultSchema.Type

/**
 * A lookup row before the HTTP layer adds its URL segment.
 *
 * The archive and the federated lookup are where these rows are *built*, and
 * neither has any business knowing what a profile URL looks like — a slug is a
 * transport concern. So they produce this and the handler finishes it, which is
 * also what keeps `@crh/core` from having to depend on `@crh/common` for a
 * string helper.
 */
export type LookupResultInput = Omit<LookupResult, "slug">

export const LookupResultsSchema = Schema.Array(LookupResultSchema)

/**
 * One player the alias index matched, with every other name they are known by.
 *
 * `mainAlias` is the alias the needle matched, so the row is labelled with the
 * name the user was typing toward; the player's other names follow.
 */
export const AliasSearchResultSchema = Schema.Struct({
    playerId: Schema.String,
    slug: Schema.String,
    mainAlias: Schema.String,
    otherAliases: Schema.Array(Schema.String),
})

export type AliasSearchResult = typeof AliasSearchResultSchema.Type

/** An alias row before the HTTP layer adds its URL segment. See {@link LookupResultInput}. */
export type AliasSearchResultInput = Omit<AliasSearchResult, "slug">

export const AliasSearchResultsSchema = Schema.Array(AliasSearchResultSchema)
