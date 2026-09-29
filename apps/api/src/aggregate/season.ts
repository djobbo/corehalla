import {
    getGloryFromBestRating,
    getGloryFromWins,
    getLegendEloReset,
    getPersonalEloReset,
} from "@crh/bhapi/calculator"
import type { Player3v3Ranked, PlayerRanked } from "@crh/bhapi/types"

/** Games required before Brawlhalla awards any glory. */
const GLORY_MIN_GAMES = 10

export type SeasonSummary = {
    readonly games: number
    readonly wins: number
    readonly peak_rating: number
    readonly glory: {
        readonly from_wins: number
        readonly from_peak_rating: number
        readonly total: number
    }
}

/**
 * Sums 1v1/2v2/3v3. Legend peaks count: glory uses the best of account and legend ratings.
 */
export const seasonSummary = (input: {
    readonly ranked: PlayerRanked | null
    readonly ranked3v3: Player3v3Ranked | null
}): SeasonSummary => {
    const { ranked, ranked3v3 } = input
    const teams = ranked?.["2v2"] ?? []

    const games = [
        ranked?.games ?? 0,
        ranked3v3?.games ?? 0,
        ...teams.map((team) => team.games),
    ]
    const wins = [
        ranked?.wins ?? 0,
        ranked3v3?.wins ?? 0,
        ...teams.map((team) => team.wins),
    ]
    const ratings = [
        ranked?.peak_rating ?? 0,
        ranked3v3?.peak_rating ?? 0,
        ...teams.map((team) => team.peak_rating),
        ...(ranked?.legends ?? []).map((legend) => legend.peak_rating),
    ]

    const totalWins = wins.reduce((total, value) => total + value, 0)
    const totalGames = games.reduce((total, value) => total + value, 0)
    const bestRating = ratings.length === 0 ? 0 : Math.max(...ratings)

    // Below the threshold the game awards nothing; do not invent a plausible number.
    if (totalGames < GLORY_MIN_GAMES) {
        return {
            games: totalGames,
            wins: totalWins,
            peak_rating: bestRating,
            glory: { from_wins: 0, from_peak_rating: 0, total: 0 },
        }
    }

    const fromWins = getGloryFromWins(totalWins)
    const fromPeakRating = getGloryFromBestRating(bestRating)

    return {
        games: totalGames,
        wins: totalWins,
        peak_rating: bestRating,
        glory: {
            from_wins: fromWins,
            from_peak_rating: fromPeakRating,
            total: fromWins + fromPeakRating,
        },
    }
}

export const legendRatingReset = getLegendEloReset

export const personalRatingReset = getPersonalEloReset
