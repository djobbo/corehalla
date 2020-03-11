const legends = require('./data/legends.json');
const fs = require('fs');
fs.writeFileSync('./legends.md', legends.reduce((acc, l) => `${acc}  \n **${l.name}**: ${l.id}`, ''));