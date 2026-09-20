import { Schema } from "effect"
import type {
    Clan,
    PlayerRanked,
    PlayerStats,
    Ranking1v1,
    Ranking2v2,
} from "bhapi/types"
import type { Legend } from "bhapi/types"
import type { BHArticle } from "web-parser/common"
import type { PR } from "web-parser/power-rankings/parsePowerRankingsPage"
import type { BHClan } from "db/generated/client"

/**
 * Declares an existing TypeScript domain type as an Effect `Schema` without
 * adding runtime validation.
 *
 * The upstream payload types (`packages/bhapi/types`, the Prisma row types, and
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

// --- response schemas ------------------------------------------------------

export const Ranking1v1Schema = json<readonly Ranking1v1[]>()
export const Ranking2v2Schema = json<readonly Ranking2v2[]>()
export const PlayerStatsSchema = json<PlayerStats>()
export const PlayerRankedSchema = json<PlayerRanked>()
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
