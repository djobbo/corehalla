import {
    getGloryFromBestRating,
    getGloryFromWins,
    getLegendEloReset,
    getPersonalEloReset,
} from "@crh/bhapi/calculator"
import { getTierFromRating } from "@crh/bhapi/helpers/getTierFromRating"

export type TierLabel = ReturnType<typeof getTierFromRating>

export type GloryBreakdown =
    | { readonly enough: false }
    | {
          readonly enough: true
          readonly fromWins: number
          readonly fromBestRating: number
          readonly total: number
      }

export type SquashedRating = {
    readonly rating: number
    readonly tier: TierLabel
}

export type EloSquash = {
    readonly personal: SquashedRating
    readonly legend: SquashedRating
}

/**
 * Glory is only awarded once a player has ten ranked games across their
 * playlists. The page asks for that threshold as a yes/no answer, because the
 * calculator never sees the profile the games are counted on.
 */
export const gloryBreakdown = ({
    hasTenGames,
    wins,
    bestRating,
}: {
    readonly hasTenGames: boolean
    readonly wins: number
    readonly bestRating: number
}): GloryBreakdown => {
    if (!hasTenGames) return { enough: false }

    const fromWins = getGloryFromWins(wins)
    const fromBestRating = getGloryFromBestRating(bestRating)

    return {
        enough: true,
        fromWins,
        fromBestRating,
        total: fromWins + fromBestRating,
    }
}

export const eloSquash = ({
    personalRating,
    legendRating,
}: {
    readonly personalRating: number
    readonly legendRating: number
}): EloSquash => {
    const personal = getPersonalEloReset(personalRating)
    const legend = getLegendEloReset(legendRating)

    return {
        personal: { rating: personal, tier: getTierFromRating(personal) },
        legend: { rating: legend, tier: getTierFromRating(legend) },
    }
}

/**
 * Reads a rating field. Anything that is not a number — blank, `"abc"`, a
 * negative — becomes zero, and a decimal is floored, so the page can keep the
 * raw string in state and still render a usable number.
 */
export const parseNumericInput = (input: string): number => {
    const trimmed = input.trim()
    if (trimmed === "") return 0

    const value = Number(trimmed)
    if (!Number.isFinite(value)) return 0

    return Math.max(0, Math.floor(value))
}
