require('dotenv').config();

const bh_api = require('./main')(process.env.BRAWLHALLA_API_KEY);
const express = require('express');

const app = express();

app.get('/:id?', (req, res) => {
	const bh_id = req.params.id || '4281946';
	const promises = [
		bh_api.fetchPlayerStats(bh_id),
		bh_api.fetchPlayerRanked(bh_id)
	];
	Promise.all(promises).then(player => {
		require('./functions/players/formatters/playerStatsFormatter')(
			bh_id,
			player[0],
			player[1]
		)
			.then(data => res.send(data))
			.catch(console.error);
	});
});
app.listen(8080, _ => console.log('App running!'));
