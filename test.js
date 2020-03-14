const clanFormat = require('./formatters/clan');

const clanData = require('./test-data/Clan.json');

console.log(clanFormat(clanData).members.officer[2]);

const fs = require('fs');
fs.writeFileSync('Clan.json', JSON.stringify(clanFormat(clanData), null, 4));
