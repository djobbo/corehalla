const fetchLeaderboard = require('../leaderboard/fetchLeaderboard');

module.exports = (api_key, name, options = { perfect_match: false, unique: false, region: 'all' }) => {
    return new Promise((resolve, reject) => {

        fetchLeaderboard(api_key, { bracket: '1v1', region, name })
            .then(lead => {
                if (options.perfect_match) {
                    var players = lead.filter(x => x.name === name);

                    if (players.length <= 1)
                        resolve(players);
                    else
                        if (options.unique) resolve(players[0]);
                        else resolve(players);
                }
                else {
                    if (lead.length <= 1)
                        resolve(lead);
                    else
                        if (options.unique) resolve(lead[0]);
                        else resolve(lead);
                }
            })
            .catch(console.error);
    })
}