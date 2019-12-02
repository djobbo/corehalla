const decodeURI = require('../util/decodeURI');
const { winrate } = require('../util/calculations');
const legendsStatsFormatter = require('./legendsStatsFormatter');

module.exports = (playerStats, playerRanked) => {
    return new Promise((resolve, reject) => {
        let legendsStats = legendsStatsFormatter(playerStats.legends || null, playerRanked.legends || null);
        let player = {
            id: playerStats.brawlhalla_id,
            name: playerStats.name,
            overall: {
                level: playerStats.level,
                xp: playerStats.xp,
                xp_percentage: playerStats.xp_percentage,
                damage: {
                }
            }
        }
    })
}