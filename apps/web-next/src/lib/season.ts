import { getTierFromRating } from "@crh/bhapi/helpers/getTierFromRating"
import { GLORY_MIN_GAMES } from "@crh/domain/aggregate/season"
import { tierLabel } from "./rankings"
import type { TierLabel } from "./calc"
import type { PlayerRanked } from "@crh/api-contract/schemas"

export type SeasonGlory =
    | {
          readonly kind: "insufficient"
          readonly games: number
          readonly required: number
      }
    | {
          readonly kind: "awarded"
          readonly total: number
          readonly fromWins: number
          readonly fromRating: number
          readonly bestRating: number
      }

/**
 * The season totals the payload already computed. Values pass through untouched:
 * recomputing them here would drift from the API's answer.
 */
export const seasonGlory = (ranked: PlayerRanked): SeasonGlory => {
    const { games, peak_rating: bestRating, glory } = ranked.stats

    if (games < GLORY_MIN_GAMES) {
        return { kind: "insufficient", games, required: GLORY_MIN_GAMES }
    }

    return {
        kind: "awarded",
        total: glory.total,
        fromWins: glory.from_wins,
        fromRating: glory.from_peak_rating,
        bestRating,
    }
}

export type EloReset = {
    readonly rating: number
    readonly tier: TierLabel
}

export type RankedBracketState =
    | { readonly kind: "missing" }
    | { readonly kind: "placements" }
    | { readonly kind: "rated"; readonly tier: string }

/**
 * Placements hide the rating, so the payload's tier is not a claim yet. The
 * flag is the only signal: a placed bracket with a null tier stays Valhallan.
 */
export const rankedBracketState = (
    bracket: NonNullable<PlayerRanked["1v1"]> | null,
): RankedBracketState => {
    if (bracket === null) return { kind: "missing" }

    if (bracket.is_placement_matches) return { kind: "placements" }

    return { kind: "rated", tier: tierLabel(bracket.tier) }
}

export const eloReset = (
    bracket: NonNullable<PlayerRanked["1v1"]> | null,
): EloReset | null =>
    bracket === null
        ? null
        : {
              rating: bracket.rating_reset,
              tier: getTierFromRating(bracket.rating_reset),
          }
