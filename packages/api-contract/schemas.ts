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
import type { BHArticle } from "@crh/web-parser/common"
import type { PR } from "@crh/web-parser/power-rankings/parsePowerRankingsPage"

/**
 * The HTTP contract's schemas.
 *
 * Two kinds live here, and the split is deliberate:
 *
 * - **Request schemas** are real `Schema` values with runtime validation,
 *   because they describe what a caller sends us and a bad query must be
 *   rejected rather than coerced.
 * - **Raw upstream schemas** use {@link json} — a `Schema.declare` passthrough —
 *   because they describe payloads we did not design and have no intention of
 *   re-validating on the way out. They back the `/upstream/brawlhalla` surface,
 *   which exists for clients that want Brawlhalla's own answer verbatim.
 *
 * The product endpoints' schemas are real, and live in `./aggregate/*`, so the
 * generated OpenAPI document describes them properly. That is the difference
 * that makes `/api/v1/docs` worth reading: a passthrough declares `unknown`.
 */

/**
 * Declares an existing TypeScript domain type as an Effect `Schema` without
 * adding runtime validation.
 *
 * The upstream payload types (`packages/bhapi/types`, the Drizzle row types, and
 * the `web-parser` output) are the contract we already rely on. `Schema.declare`
 * keeps the full codec metadata that `HttpApi` needs for response encoding while
 * accepting any decoded value.
 *
 * Note: the return type is intentionally not annotated as `Schema.Schema<A>` —
 * that structural type strips the codec metadata and makes `HttpApi` treat the
 * endpoint as requiring unknown services.
 */
const json = <A>() => Schema.declare<A>((_u): _u is A => true)

// --- request schemas -------------------------------------------------------

/**
 * The three ranked brackets, and the axis every ladder surface shares.
 *
 * Distinct from `Bracket` below, which is the *power* rankings' axis and has no
 * 3v3 — that source does not publish one.
 */
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

export const Bracket = Schema.Literals(["1v1", "2v2"])

export const PowerRankingsRegion = Schema.Literals([
    "us-e",
    "eu",
    "sea",
    "brz",
    "aus",
])

export const ArticleCategory = Schema.Literals([
    "",
    "weekly-rotation",
    "patch-notes",
])

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

/**
 * The stats a *legend* leaderboard can order by.
 *
 * The columns of `BHPlayerLegend`, minus the ones that describe a pairing of
 * two weapons rather than a legend: `damageWeaponOne`/`Two`, `koWeaponOne`/`Two`
 * and the unarmed/thrown/gadget breakdowns are all readable per legend, but on a
 * board filtered to one legend the slot numbers are not what anyone is asking —
 * "who has the most Bodvar games" is. The weapon boards cover the per-weapon
 * question properly, from their own table.
 */
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

/** The stats a *weapon* leaderboard can order by — the columns its table has. */
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

/**
 * The weapon a weapon leaderboard is filtered to.
 *
 * The published list rather than a free string: the value is a column match
 * against `weapon_name`, so an unlisted one would silently return an empty board
 * instead of being rejected.
 */
export const Weapon = Schema.Literals(weapons)

// --- raw upstream response schemas -----------------------------------------

export const Ranking1v1Schema = json<readonly Ranking1v1[]>()
export const Ranking2v2Schema = json<readonly Ranking2v2[]>()
export const Ranking3v3Schema = json<readonly Ranking3v3[]>()
export const PlayerStatsSchema = json<PlayerStats>()
export const PlayerRankedSchema = json<PlayerRanked>()
export const Player3v3RankedSchema = json<Player3v3Ranked>()
export const PlayerAliasesSchema = json<readonly string[]>()
export const ClanSchema = json<Clan>()
export const ArticlesSchema = json<readonly BHArticle[]>()
export const PowerRankingsSchema = json<readonly PR[]>()

// --- aggregated product schemas --------------------------------------------
//
// Re-exported rather than declared here so the contract keeps one module per
// page while `@crh/api-contract/schemas` stays the single import a client uses.

export * from "./aggregate/common"
export * from "./aggregate/player"
export * from "./aggregate/guild"
export * from "./aggregate/rankings"
export * from "./aggregate/search"

/**
 * How many characters a lookup needs before it is worth a request.
 *
 * Shared by the server, which refuses to search below it, and the client, which
 * shows a "keep typing" hint instead of an empty result list. A private copy on
 * either side would drift into a state where one sends requests the other
 * ignores, or the UI promises results for a query the API will not run.
 */
export const MIN_LOOKUP_LENGTH = 3

// --- app-owned auth ---------------------------------------------------------

/**
 * A signed-in user's profile.
 *
 * Deliberately a subset of the `UserProfile` row: the Discord id and email are
 * the only identity fields a page shows, and `createdAt` is shown nowhere.
 * `HttpApi` encodes to exactly this shape, so a column added to the table later
 * cannot leak into a response by default.
 */
export const UserProfileSchema = Schema.Struct({
    id: Schema.String,
    discordId: Schema.NullOr(Schema.String),
    username: Schema.String,
    avatarUrl: Schema.String,
    email: Schema.NullOr(Schema.String),
})

export type UserProfile = typeof UserProfileSchema.Type

/**
 * The session endpoint's answer.
 *
 * `user: null` is an ordinary value rather than a 401, so a client can render
 * "signed out" without treating it as a failed request.
 */
export const SessionSchema = Schema.Struct({
    user: Schema.NullOr(UserProfileSchema),
})

/**
 * A saved player or clan.
 *
 * `meta` is presentation only — currently a player's main-legend key, so a
 * favourites grid can show the same art the profile header does. It is
 * `Unknown` because it is client-authored: the server stores it verbatim and
 * never reads it.
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

/** One linked Discord account. */
export const ConnectionSchema = Schema.Struct({
    type: Schema.String,
    appId: Schema.String,
    name: Schema.String,
    verified: Schema.Boolean,
})

export type Connection = typeof ConnectionSchema.Type
