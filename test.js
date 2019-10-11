const bh_api = require('./main')(process.env.BRAWLHALLA_API_KEY);
const express = require('express');

const app = express();

app.get('/:id?', (req, res) => {
    bh_api.fetchPlayerStats(req.params.id || '4281946')
        .then(player => {
            //console.log(player);
            require('./functions/players/formatters/playerLegendsWeaponsStatsFormatter')(player.legends)
                .then(data => res.send(data));
        })
})

app.listen(8080, _ => console.log('App running!'));

// alfie 4281946
// smawl 6014714