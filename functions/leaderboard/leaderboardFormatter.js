const decodeURI = require('../util/decodeURI');
const calculateWinrate = require('../util/calculateWinrate');

module.exports = (leaderboard, bracket) => {
    return new Promise((resolve, reject) => {
        resolve(leaderboard.map(x => {
            let bracketSpecs;
            if (bracket === '2v2') {
                var teamname = decodeURI(x.teamname);
                bracketSpecs = {
                    player_one_name: teamname.substring(0, teamname.indexOf('+')),
                    player_two_name: teamname.substring(teamname.indexOf('+') + 1),
                    player_one_id: x.brawlhalla_id_one,
                    player_two_id: x.brawlhalla_id_two,
                }
            }
            else {
                bracketSpecs = {
                    player_name: decodeURI(x.name),
                    player_id: x.brawlhalla_id,
                }
            }
            return {
                ...bracketSpecs,
                ...{
                    rank: x.rank,
                    games: x.games,
                    wins: x.wins,
                    losses: x.games - x.wins,
                    rating: x.rating,
                    peak_rating: x.peak_rating,
                    tier: x.tier,
                    region: x.region.toUpperCase(),
                    winrate: calculateWinrate(x.wins, x.games, 1)
                }
            }
        }))
    })
}