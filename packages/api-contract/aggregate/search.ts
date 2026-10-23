import { Schema } from "effect"

/**
 * Players and clans share one list; inapplicable fields are `null` rather than
 * absent so the row shape does not depend on `type`.
 */
export const LookupResultSchema = Schema.Struct({
    type: Schema.Literals(["player", "clan"]),
    id: Schema.String,
    name: Schema.String,
    slug: Schema.String,
    /**
     * From the local alias index — the only way a renamed player is findable
     * by an old name (rankings search knows current names only).
     */
    aliases: Schema.Array(Schema.String),
    /** `null` for a clan, or a player found only locally. */
    rating: Schema.NullOr(Schema.Number),
    /** `null` for a player. */
    xp: Schema.NullOr(Schema.Number),
    tier: Schema.NullOr(Schema.String),
    region: Schema.NullOr(Schema.String),
    /** On the wire so a silent upstream outage remains observable. */
    source: Schema.Literals(["rankings", "archive"]),
})

export type LookupResult = typeof LookupResultSchema.Type

/** Built without a slug; the HTTP layer adds it. Keeps core free of `@crh/common`. */
export type LookupResultInput = Omit<LookupResult, "slug">

export const LookupResultsSchema = Schema.Array(LookupResultSchema)

/** `mainAlias` is the alias the needle matched; other names follow. */
export const AliasSearchResultSchema = Schema.Struct({
    playerId: Schema.String,
    slug: Schema.String,
    mainAlias: Schema.String,
    otherAliases: Schema.Array(Schema.String),
})

export type AliasSearchResult = typeof AliasSearchResultSchema.Type

/** Alias row before the HTTP layer adds its URL segment. See {@link LookupResultInput}. */
export type AliasSearchResultInput = Omit<AliasSearchResult, "slug">

export const AliasSearchResultsSchema = Schema.Array(AliasSearchResultSchema)
