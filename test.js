const bh_api = require('./main')(process.env.BRAWLHALLA_API_KEY);

bh_api.fetchLeaderboard({page: '5'})
    .then(data => console.log(data.filter(x => x.rank === '248').map(x => `${x.name} • ${decodeURI(x.name)}`)))