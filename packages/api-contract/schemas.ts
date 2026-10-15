import { Schema } from "effect"
import type {
    Clan,
    Player3v3Ranked,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
    Ranking3v3,
} from "@crh/bhapi/types"
import { weapons } from "@crh/bhapi/constants"
import type { BHArticle, BHArticleDetail } from "@crh/web-parser/common"

/**
 * Passthrough `Schema.declare` for upstream types we do not re-validate.
 * Do not annotate the return as `Schema.Schema<A>` — that strips codec
 * metadata and makes `HttpApi` require unknown services.
 */
const json = <A>() => Schema.declare<A>((_u): _u is A => true)

/** Ranked ladders; distinct from `PowerRankingsGameMode` (power rankings — no 3v3). */
export const Ladder = Schema.Literals(["1v1", "2v2", "3v3"])

export type Ladder = typeof Ladder.Type

export const RankedRegion = Schema.Literals([
    "all",
    "us-e",
    "eu",
    "sea",
    "brz",
    "aus",
    "us-w",
    "jpn",
    "sa",
    "me",
])

/** Power rankings game modes; brawltools (the source) has no 3v3. */
export const PowerRankingsGameMode = Schema.Literals(["1v1", "2v2"])

export type PowerRankingsGameMode = typeof PowerRankingsGameMode.Type

/** brawltools region codes — its own vocabulary, not the ranked-ladder slugs. */
export const PowerRankingsRegion = Schema.Literals([
    "NA",
    "EU",
    "SA",
    "SEA",
    "MENA",
    "LAN",
])

export type PowerRankingsRegion = typeof PowerRankingsRegion.Type

/**
 * Sortable columns. Direction is derived server-side: the rank and name ascend,
 * every count/currency metric descends. `playerId` is sortable upstream but not
 * exposed — it is only a pagination aid.
 */
export const PowerRankingsOrderBy = Schema.Literals([
    "playerName",
    "top8",
    "top32",
    "gold",
    "silver",
    "bronze",
    "powerRanking",
    "points",
    "earnings",
])

export type PowerRankingsOrderBy = typeof PowerRankingsOrderBy.Type

export const PowerRankingsPlayerSchema = Schema.Struct({
    /** brawltools' "esports" ID — not a Brawlhalla ID. */
    esportsId: Schema.Number,
    playerName: Schema.String,
    /** brawltools' full display name (its `name`); null when unavailable. */
    fullName: Schema.NullOr(Schema.String),
    /** Preferred pronouns; null when not set. */
    pronoun: Schema.NullOr(Schema.String),
    /**
     * brawltools identities. All nullable: `brawlhallaId` is unknown for some
     * players, and upstream omits socials/country when empty.
     */
    brawlhallaId: Schema.NullOr(Schema.Number),
    sggPlayerId: Schema.NullOr(Schema.Number),
    cmPlayerId: Schema.NullOr(Schema.String),
    twitter: Schema.NullOr(Schema.String),
    twitch: Schema.NullOr(Schema.String),
    country: Schema.NullOr(Schema.String),
    /** Player-stats slug; null when `brawlhallaId` is unknown (render unlinked). */
    slug: Schema.NullOr(Schema.String),
    top8: Schema.Number,
    top32: Schema.Number,
    gold: Schema.Number,
    silver: Schema.Number,
    bronze: Schema.Number,
    powerRanking: Schema.Number,
    points: Schema.Number,
    earnings: Schema.Number,
})

export type PowerRankingsPlayer = typeof PowerRankingsPlayerSchema.Type

/**
 * `updated_at` is the fetch time (epoch ms); `total_pages` is brawltools' own
 * count and already accounts for the requested `max_results`.
 */
export const PowerRankingsMetaSchema = Schema.Struct({
    updated_at: Schema.Number,
    total_pages: Schema.Number,
})

export const PowerRankingsEnvelopeSchema = Schema.Struct({
    data: Schema.Array(PowerRankingsPlayerSchema),
    meta: PowerRankingsMetaSchema,
})

export type PowerRankingsEnvelope = typeof PowerRankingsEnvelopeSchema.Type

/** Free-form WordPress category slug (`patch-notes`, `esports`, …); `""` is "all". */
export const NewsCategory = Schema.String

export type NewsCategory = typeof NewsCategory.Type

export type ArticlesPage = {
    readonly articles: readonly BHArticle[]
    readonly hasNextPage: boolean
}

/** Kept here so the API's page maths and the client's page links cannot drift. */
export const NEWS_PAGE_SIZE = 12

export type {
    BHArticle,
    BHArticleCategory,
    BHArticleDetail,
} from "@crh/web-parser/common"

export const sortablePlayerProps = [
    "xp",
    "games",
    "wins",
    "rankedGames",
    "rankedWins",
    "damageDealt",
    "damageTaken",
    "kos",
    "falls",
    "suicides",
    "teamKos",
    "matchTime",
    "damageUnarmed",
    "koUnarmed",
    "matchTimeUnarmed",
    "koThrownItem",
    "damageThrownItem",
    "koGadgets",
    "damageGadgets",
] as const

export const SortablePlayerProp = Schema.Literals(sortablePlayerProps)

export type SortablePlayerProp = typeof SortablePlayerProp.Type

/** Legend-board columns only — weapon-slot and unarmed/gadget breakdowns excluded. */
export const sortableLegendProps = [
    "games",
    "wins",
    "kos",
    "falls",
    "suicides",
    "teamKos",
    "matchTime",
    "damageDealt",
    "damageTaken",
    "timeHeldWeaponOne",
    "timeHeldWeaponTwo",
    "xp",
    "level",
] as const

export const SortableLegendProp = Schema.Literals(sortableLegendProps)

export type SortableLegendProp = typeof SortableLegendProp.Type

export const sortableWeaponProps = [
    "games",
    "wins",
    "kos",
    "matchTime",
    "damageDealt",
    "xp",
    "level",
] as const

export const SortableWeaponProp = Schema.Literals(sortableWeaponProps)

export type SortableWeaponProp = typeof SortableWeaponProp.Type

/** Published list only — an unlisted weapon would silently return an empty board. */
export const Weapon = Schema.Literals(weapons)

export const Ranking1v1Schema = json<readonly Ranking1v1[]>()
export const Ranking2v2Schema = json<readonly Ranking2v2[]>()
export const Ranking3v3Schema = json<readonly Ranking3v3[]>()
export const PlayerStatsSchema = json<PlayerStats>()
export const PlayerRankedSchema = json<PlayerRanked>()
export const Player3v3RankedSchema = json<Player3v3Ranked>()
export const PlayerAliasesSchema = json<readonly string[]>()
export const ClanSchema = json<Clan>()
export const ArticlesPageSchema = json<ArticlesPage>()
export const ArticleSchema = json<BHArticleDetail>()

export * from "./aggregate/common"
export * from "./aggregate/player"
export * from "./aggregate/esports"
export * from "./aggregate/guild"
export * from "./aggregate/rankings"
export * from "./aggregate/search"

/** Shared by server (rejects below) and client ("keep typing" hint). */
export const MIN_LOOKUP_LENGTH = 3

/**
 * Subset of the `UserProfile` row — `HttpApi` encodes exactly this, so a new
 * table column cannot leak into a response by default.
 */
export const UserProfileSchema = Schema.Struct({
    id: Schema.String,
    discordId: Schema.NullOr(Schema.String),
    username: Schema.String,
    avatarUrl: Schema.String,
    email: Schema.NullOr(Schema.String),
})

export type UserProfile = typeof UserProfileSchema.Type

/** `user: null` is ordinary (signed out), not a 401. */
export const SessionSchema = Schema.Struct({
    user: Schema.NullOr(UserProfileSchema),
})

/**
 * `meta` is client-authored presentation data; the server stores it verbatim
 * and never reads it.
 */
export const FavoriteSchema = Schema.Struct({
    id: Schema.String,
    type: Schema.String,
    name: Schema.String,
    meta: Schema.Unknown,
})

export type Favorite = typeof FavoriteSchema.Type

export const FavoriteInputSchema = Schema.Struct({
    id: Schema.String,
    type: Schema.String,
    name: Schema.String,
    meta: Schema.Unknown,
})

export const ConnectionSchema = Schema.Struct({
    type: Schema.String,
    appId: Schema.String,
    name: Schema.String,
    verified: Schema.Boolean,
})

export type Connection = typeof ConnectionSchema.Type
