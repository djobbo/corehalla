import {
    getGloryFromBestRating,
    getGloryFromWins,
    getLegendEloReset,
    getPersonalEloReset,
} from "@crh/bhapi/calculator"
import type { Player3v3Ranked, PlayerRanked } from "@crh/bhapi/types"

/**
 * The season roll-up the profile shows, adapted from kubi.
 *
 * `kubi` computes this from its own ranked payload, which carries a "rotating"
 * bracket corehalla has no equivalent for. Corehalla's ranked data is split
 * across two upstreams — v0 for 1v1 and 2v2, v1 for 3v3 — so the summary takes
 * both and sums across every bracket that has games. That is the whole reason
 * this is a function here rather than a field on a payload.
 *
 * The glory formulas themselves are Brawlhalla's and already live in
 * `@crh/bhapi/calculator`; this only decides *which* brackets feed them.
 */

/** How many games a season needs before glory is awarded at all. */
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
 * Every bracket's games, wins and peak ratings, with 3v3 folded in.
 *
 * Legend peaks are included in the rating list because a player can hold a
 * legend rating above their account rating; Brawlhalla awards glory from the
 * best of them.
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

    // Below the threshold Brawlhalla awards nothing, and computing the formula
    // anyway would print a plausible-looking number for a player who has not
    // earned it.
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

/** Elo after a season reset, for a legend or a 2v2 team. */
export const legendRatingReset = getLegendEloReset

/** Elo after a season reset, for a personal 1v1 or 3v3 rating. */
export const personalRatingReset = getPersonalEloReset
