# Brawlhalla API Wrapper for Node.js

## Useful Links

Brawlhalla API & Keys info: [dev.brawlhalla.com](http://dev.brawlhalla.com)

Corehalla: [corehalla.com](http://corehalla.com)

## Installation

Install via NPM:

```bash
$ npm i corehalla.js
```

Install via yarn:

```bash
$ yarn add corehalla.js
```

## Configuration

Import the module and connect using your API key:

```js
const bh_api = require('corehalla.js')('API_KEY');
```

## Methods

### Rankings

#### .fetchRankings(options)

> _Uses One Brawlhalla API Call_

Retrieves an array of rankings ordered and paginated 50 at a time.

**Options**

The options object contains 4 fields defining which section of the ranked leaderboard is sent back. Some/all options can be omitted and will be assigned a default value.

| Parameter         | Description                                                                                                                     | Default Value |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **`bracket`**     | Either `'1v1'` or `'2v2'`.                                                                                                      | `'1v1'`       |
| **`region`**      | The region from this subset `'us-e'`, `'eu'`, `'sea'`, `'brz'`, `'aus'`, `'us-w'`, `'jpn'`.</br>For Global region, use `'all'`. | `'all'`       |
| **`page`**        | The page number requested.</br>(Can either be an Integer or a String)                                                           | `1`           |
| **`player_name`** | The in-game name to query against.</br>Name searching must start with exact match.                                              | `''`          |

Example:

```js
let options = {
	bracket: '2v2',
	region: 'eu',
	page: 3 // or page: '3',
};
```

**Usage**

Using Promises

```js
bh_api
	.fetchRankings(options)
	.then(rankings => {
		console.log(rankings); // Do stuff
	})
	.catch(error => console.error(error));
```

Using Async/Await

```js
async function getRankings() {
	try {
		const rankings = await bh_api.fetchRankings(options);
		console.log(rankings); // Do stuff
	} catch (error) {
		console.error(error);
	}
}
```

**Output**

<details>
  <summary>The above function returns JSON structured like this</summary>

```json
[
	{
		"rank": "1",
		"name": "Dobrein\u00f0\u009f\u0091\u00bb",
		"brawlhalla_id": 20877,
		"best_legend": 25,
		"best_legend_games": 719,
		"best_legend_wins": 642,
		"rating": 2872,
		"tier": "Diamond",
		"games": 719,
		"wins": 642,
		"region": "EU",
		"peak_rating": 2872
	},
	{
		"rank": "2",
		"name": "Maltimum",
		"brawlhalla_id": 299070,
		"best_legend": 20,
		"best_legend_games": 774,
		"best_legend_wins": 572,
		"rating": 2697,
		"tier": "Diamond",
		"games": 774,
		"wins": 572,
		"region": "EU",
		"peak_rating": 2804
	}
]
```

</details>

### Players

#### .fetchPlayerStats(brawlhalla_id)

> _Uses One Brawlhalla API Call_

Retrieves the stats of a specific player.

**Brawlhalla ID**

The Brawlhalla ID of a player. Can either be an Integer or a String.

Example:

```js
let brawlhalla_id = 4281946; // or let brawlhalla_id = '4281946';
```

**Usage**

Using Promises

```js
bh_api
	.fetchPlayerStats(brawlhalla_id)
	.then(stats => {
		console.log(stats); // Do stuff
	})
	.catch(error => console.error(error));
```

Using Async/Await

```js
async function getPlayerStats() {
	try {
		const stats = await bh_api.fetchPlayerStats(brawlhalla_id);
		console.log(stats); // Do stuff
	} catch (error) {
		console.error(error);
	}
}
```

**Output**

<details>
  <summary>The above function returns JSON structured like this</summary>

```json
{
	"brawlhalla_id": 2,
	"name": "bmg | dan",
	"xp": 191718,
	"level": 47,
	"xp_percentage": 0.6252398209337,
	"games": 8,
	"wins": 2,
	"damagebomb": "29",
	"damagemine": "0",
	"damagespikeball": "0",
	"damagesidekick": "14",
	"hitsnowball": 0,
	"kobomb": 0,
	"komine": 0,
	"kospikeball": 0,
	"kosidekick": 0,
	"kosnowball": 0,
	"legends": [
		{
			"legend_id": 30,
			"legend_name_key": "val",
			"damagedealt": "317",
			"damagetaken": "458",
			"kos": 0,
			"falls": 3,
			"suicides": 0,
			"teamkos": 0,
			"matchtime": 155,
			"games": 3,
			"wins": 0,
			"damageunarmed": "15",
			"damagethrownitem": "1",
			"damageweaponone": "77",
			"damageweapontwo": "224",
			"damagegadgets": "0",
			"kounarmed": 0,
			"kothrownitem": 0,
			"koweaponone": 0,
			"koweapontwo": 0,
			"kogadgets": 0,
			"timeheldweaponone": 38,
			"timeheldweapontwo": 97,
			"xp": 97,
			"level": 1,
			"xp_percentage": 0.46190476190476
		},
		{
			"legend_id": 29,
			"legend_name_key": "wu shang",
			"damagedealt": "0",
			"damagetaken": "0",
			"kos": 0,
			"falls": 0,
			"suicides": 0,
			"teamkos": 0,
			"matchtime": 0,
			"games": 0,
			"wins": 0,
			"damageunarmed": "0",
			"damagethrownitem": "0",
			"damageweaponone": "0",
			"damageweapontwo": "0",
			"damagegadgets": "0",
			"kounarmed": 0,
			"kothrownitem": 0,
			"koweaponone": 0,
			"koweapontwo": 0,
			"kogadgets": 0,
			"timeheldweaponone": 0,
			"timeheldweapontwo": 0,
			"xp": 260,
			"level": 2,
			"xp_percentage": 0.13586956521739
		}
	],
	"clan": {
		"clan_name": "Blue Mammoth Games",
		"clan_id": 1,
		"clan_xp": "86962",
		"personal_xp": 4492
	}
}
```

</details>

---

### Clans

### Static Data
