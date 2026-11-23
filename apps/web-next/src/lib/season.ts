import { getTierFromRating } from "@crh/bhapi/helpers/getTierFromRating"
import { GLORY_MIN_GAMES } from "@crh/domain/aggregate/season"
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

export const eloReset = (
    bracket: NonNullable<PlayerRanked["1v1"]> | null,
): EloReset | null =>
    bracket === null
        ? null
        : {
              rating: bracket.rating_reset,
              tier: getTierFromRating(bracket.rating_reset),
          }
