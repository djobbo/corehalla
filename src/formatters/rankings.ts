import {
    IRanking1v1,
    IRanking2v2,
    IRanking1v1Format,
    IRanking2v2Format,
} from '../types';

export function format1v1Rankings(
    rankings: IRanking1v1[]
): IRanking1v1Format[] {
    return rankings.map<IRanking1v1Format>(
        ({
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
        }) => ({
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
    );
}

export function format2v2Rankings(
    rankings: IRanking2v2[]
): IRanking2v2Format[] {
    return rankings.map<IRanking2v2Format>(
        ({
            rank,
            rating,
            tier,
            games,
            wins,
            region,
            peak_rating: peak,
            teamname,
            brawlhalla_id_one,
            brawlhalla_id_two,
            twitch_name_one,
            twitch_name_two,
        }) => {
            const playerNames = teamname.split('+');
            return {
                rank,
                rating,
                tier,
                games,
                wins,
                region,
                peak,
                players: [
                    {
                        name: playerNames[0],
                        id: brawlhalla_id_one,
                        twitchName: twitch_name_one,
                    },
                    {
                        name: playerNames[1],
                        id: brawlhalla_id_two,
                        twitchName: twitch_name_two,
                    },
                ],
            };
        }
    );
}
