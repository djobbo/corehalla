const fs = require('fs');
require('dotenv').config();

const playerStatsFormatter = require('./functions/players/formatters/playerStatsFormatter');

const bh_api = require('./main')(process.env.BRAWLHALLA_API_KEY);

const bh_id = 4281946;
const promises = [
	bh_api.fetchPlayerStats(bh_id),
	bh_api.fetchPlayerRanked(bh_id)
];
Promise.all(promises).then(player => {
	playerStatsFormatter(bh_id, player[0], player[1])
		.then(data =>
			fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
		)
		.catch(console.error);
});
