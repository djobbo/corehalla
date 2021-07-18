import { getPersonalRatingSquash, getGloryFromBestRating, getGloryFromWins } from '~calc'
import { IPlayerRanked, IPlayerSeasonFormat } from '~types'
import { formatTeamsStats } from './formatTeamsStats'

export const getSeasonStats = (playerRanked?: IPlayerRanked): IPlayerSeasonFormat => {
    const {
        brawlhalla_id: playerID,
        rating = NaN,
        peak_rating = NaN,
        games = 0,
        wins = 0,
        tier = 'Unranked',
        region = 'US-W',
        ['2v2']: teams = [],
        legends = [],
    } = playerRanked ?? {}

    const totalWins = wins + teams.reduce((acc, team) => acc + team.wins, 0)

    const bestOverallRating = Math.max(
        peak_rating,
        ...teams.map((team) => team.peak_rating),
        ...legends.map((legend) => legend.peak_rating),
    )

    return {
        rating,
        games,
        tier,
        peak: peak_rating,
        wins,
        region,
        ratingSquash: getPersonalRatingSquash(rating),
        totalWins,
        bestOverallRating,
        glory: {
            bestRating: getGloryFromBestRating(bestOverallRating),
            wins: getGloryFromWins(totalWins),
        },
        teams: playerID === undefined ? [] : formatTeamsStats(playerID, teams),
    }
}
