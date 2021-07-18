import type { IRanking1v1, IRanking1v1Format } from '~types'

export const format1v1Ranking = ({
    rank,
    rating,
    tier,
    games,
    wins,
    region,
    peak_rating: peak,
    name,
    brawlhalla_id: id,
    twitch_name: twitchName,
    best_legend,
    best_legend_games,
    best_legend_wins,
}: IRanking1v1): IRanking1v1Format => ({
    rank,
    name,
    id,
    rating,
    tier,
    games,
    wins,
    region,
    peak,
    bestLegend: {
        id: best_legend,
        games: best_legend_games,
        wins: best_legend_wins,
    },
    twitchName,
})

export const format1v1Rankings = (rankings: IRanking1v1[]): IRanking1v1Format[] => rankings.map(format1v1Ranking)
