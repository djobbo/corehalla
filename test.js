const fs = require('fs');

//#region Test 1

// const api_key = process.env.BRAWLHALLA_API_KEY;

// const { fetchPlayerFormat } = require('./main')(api_key);

// fetchPlayerFormat(4821946).then(data => {
// 	fs.writeFileSync('data.json', JSON.stringify(data, null, 4));
// });

//#endregion

//#region reformat

// const data = require('./data/legends.json');
// fs.writeFileSync(
// 	'./data/parsedLegends.json',
// 	JSON.stringify(
// 		data.map(
// 			({
// 				legend_id,
// 				legend_name_key,
// 				bio_name,
// 				weapon_one,
// 				weapon_two
// 			}) => ({
// 				id: legend_id,
// 				name: bio_name,
// 				slug: legend_name_key,
// 				weapon_one,
// 				weapon_two
// 			})
// 		)
// 	)
// );

// const data = require('./data/legends.json');
// fs.writeFileSync(
// 	'./data/weapons.json',
// 	JSON.stringify(
// 		data.reduce(
// 			(acc, { weapon_one, weapon_two }) => {
// 				if (!acc.weapons.find(w => w.name === weapon_one)) {
// 					acc.weapons.push({ id: acc.id, name: weapon_one });
// 					acc.id += 1;
// 				}
// 				if (!acc.weapons.find(w => w.name === weapon_two)) {
// 					acc.weapons.push({ id: acc.id, name: weapon_two });
// 					acc.id += 1;
// 				}
// 				return acc;
// 			},
// 			{ id: 0, weapons: [] }
// 		)
// 	)
// );

//#endregion

//#region display legends/weapons

// console.log(require('./data/legends.json').map(l => l.name));
// console.log(require('./data/weapons.json').map(w => w.name));

//#endregion

const newform = require('./formatters/playerStats');

const [stats, ranked] = [
	require('./test-data/PlayerStats.json'),
	require('./test-data/PlayerRanked.json')
];

const format = newform(stats, ranked);

fs.writeFileSync('data.json', JSON.stringify(format, null, 4));
