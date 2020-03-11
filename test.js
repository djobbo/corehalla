const bh_api = require('./main')(process.env.BRAWLHALLA_API_KEY);
const fs = require('fs');

bh_api
	.fetchPlayerFormat(4281946)
	.then(p => fs.writeFileSync('data.json', JSON.stringify(p, null, 4)))
	.catch(console.error);
