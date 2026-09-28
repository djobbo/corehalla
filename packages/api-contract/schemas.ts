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
import type { Legend } from "@crh/bhapi/types"
import { weapons } from "@crh/bhapi/constants"
import type { BHArticle } from "@crh/web-parser/common"
import type { PR } from "@crh/web-parser/power-rankings/parsePowerRankingsPage"
import type { BHClan } from "@crh/db/schema"
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

// --- response schemas ------------------------------------------------------

export const Ranking1v1Schema = json<readonly Ranking1v1[]>()
export const Ranking2v2Schema = json<readonly Ranking2v2[]>()
export const Ranking3v3Schema = json<readonly Ranking3v3[]>()
export const PlayerStatsSchema = json<PlayerStats>()
export const PlayerRankedSchema = json<PlayerRanked>()
export const Player3v3RankedSchema = json<Player3v3Ranked>()
export const PlayerAliasesSchema = json<readonly string[]>()
export const ClanSchema = json<Clan>()
export const ClansSchema = json<readonly BHClan[]>()
export const WeeklyRotationSchema = json<readonly Legend[]>()
export const ArticlesSchema = json<readonly BHArticle[]>()
export const PowerRankingsSchema = json<readonly PR[]>()

export type GlobalPlayerRanking = {
    id: string
    name: string
    tier: string
    rating: number
    peakRating: number
    region: string
    prop: number
}

export const GlobalPlayerRankingsSchema = json<readonly GlobalPlayerRanking[]>()

export type AliasSearchResult = {
    playerId: string
    mainAlias: string
    otherAliases: string[]
}

export const AliasSearchResultsSchema = json<readonly AliasSearchResult[]>()

/**
 * One row of the federated lookup.
 *
 * Players and clans share one list, so every row carries the discriminants the
 * UI needs to render a badge and a link (`type`, `id`) plus whichever prominence
 * number applies to that type. Fields that do not apply are `null` rather than
 * absent, so a row's shape does not depend on its type.
 */
export type LookupResult = {
    readonly type: "player" | "clan"
    readonly id: string
    /** The name to display: current name for a player, name for a clan. */
    readonly name: string
    /**
     * Other names this player has played under.
     *
     * The rankings search only knows current names, so this is the only way a
     * renamed player is findable by an old name — it comes from the local alias
     * index.
     */
    readonly aliases: readonly string[]
    /** Current 1v1 rating. `null` for a clan, or for a player found only locally. */
    readonly rating: number | null
    /** Clan XP. `null` for a player. */
    readonly xp: number | null
    readonly tier: string | null
    readonly region: string | null
    /**
     * Which source produced the row.
     *
     * Kept on the wire so the rankings quality is observable: a lookup that
     * silently stopped reaching the upstream ladder would otherwise look like a
     * complete result set.
     */
    readonly source: "rankings" | "archive"
}

export const LookupResultsSchema = json<readonly LookupResult[]>()

/**
 * One ladder entry the activity sampler saw queue.
 *
 * An entry rather than a player, because the ladders differ: a 1v1 or 3v3 entry
 * is one player and a 2v2 entry is a team. `members` is where that shows, and
 * it is always a list so the renderer does not branch — one name for a solo
 * ladder, two for a team.
 *
 * `queuedAt` is an epoch millisecond rather than a date because it is only ever
 * compared against "now" on the client — how long ago they played is the whole
 * of what it means.
 */
export type QueuedEntry = {
    readonly id: string
    readonly members: readonly {
        readonly id: string
        readonly name: string
    }[]
    readonly rating: number
    readonly peakRating: number
    readonly tier: string
    readonly games: number
    readonly wins: number
    readonly queuedAt: number
    /** Position on this ladder when they last queued. */
    readonly rank: number
    /** Rating change since their previous game. Signed. */
    readonly ratingDelta: number
    /** Places gained (positive) or lost (negative). Signed. */
    readonly rankDelta: number
}

export const RankedQueueSchema = json<readonly QueuedEntry[]>()

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
