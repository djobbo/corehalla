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

Import the module and connect using your api key:

```js
const bh_api = require('corehalla.js')('API_KEY');
```

## Methods

### Rankings

#### .fetchRankings(options)
> *Uses One Brawlhalla API Call*

Retrieves an array of rankings ordered and paginated 50 at a time.

**Options**

The options object contains 4 fields defining which section of the ranked leaderboard is sent back. Some/all options can be ommited and will be assigned a default value.

| Parameter | Description | Default Value |
| --- | --- | --- |
| **`bracket`** | Either `'1v1'` or `'2v2'`. | `'1v1'` |
| **`region`** | The region from this subset `'us-e'`, `'eu'`, `'sea'`, `'brz'`, `'aus'`, `'us-w'`, `'jpn'`.</br>For Global region, use `'all'`. | `'all'` |
| **`page`** | The page number requested.</br>(Can either be an Integer or a String) | `1` |
| **`player_name`** | The ingame name to query against.</br>Name searching must start with exact match. | `''` |

Example:

```js
let options = {
	bracket: '2v2',
	region: 'eu',
	page: 3, // Or '3'
}
```

**Usage**

Using Promises

```js
bh_api.fetchRankings(options)
    .then(rankings => {
        console.log(rankings); // Do stuff
    })
    .catch(error => console.error(error));
```

Using Async/Await

```js
async function getRankings(options) {
    try  {
        const rankings = await bh_api.fetchRankings(options);
        console.log(rankings); // Do stuff
    }
    catch(error) {
        console.error(error);
    }
}
```

**Output**

<details>
  <summary>The above function returns an array of objects structured like this</summary>

```js
[
  {
    rank: "1",
    name: "Dobrein\u00f0\u009f\u0091\u00bb",
    brawlhalla_id: 20877,
    best_legend: 25,
    best_legend_games: 719,
    best_legend_wins: 642,
    rating: 2872,
    tier: "Diamond",
    games: 719,
    wins: 642,
    region: "EU",
    peak_rating: 2872
  },
  {
    rank: "2",
    name: "Maltimum",
    brawlhalla_id: 299070,
    best_legend: 20,
    best_legend_games: 774,
    best_legend_wins: 572,
    rating: 2697,
    tier: "Diamond",
    games: 774,
    wins: 572,
    region: "EU",
    peak_rating: 2804
  }
]
```

</details>

---

### Players

#### .fetchPlayerStats(brawlhalla_id)
> *Uses One Brawlhalla API Call*

Retrieves the stats of a specific player.

**Brawlhalla ID**

The unique ID of a player. *Can either be an Integer or a String.*

Example:

```js
let brawlhalla_id = 4281946; // Or '4281946'
```

**Usage**

Using Promises

```js
bh_api.fetchPlayerStats(brawlhalla_id)
    .then(stats => {
        console.log(stats); // Do stuff
    })
    .catch(error => console.error(error));
```

Using Async/Await

```js
async function getPlayerStats(brawlhalla_id) {
    try  {
        const stats = await bh_api.fetchPlayerStats(brawlhalla_id);
        console.log(stats); // Do stuff
    }
    catch(error) {
        console.error(error);
    }
}
```

**Output**
<details>
  <summary>The above function returns an object structured like this</summary>

```js
{
  brawlhalla_id: 2,
  name: "bmg | dan",
  xp: 191718,
  level: 47,
  xp_percentage: 0.6252398209337,
  games: 8,
  wins: 2,
  damagebomb: "29",
  damagemine: "0",
  damagespikeball: "0",
  damagesidekick: "14",
  hitsnowball: 0,
  kobomb: 0,
  komine: 0,
  kospikeball: 0,
  kosidekick: 0,
  kosnowball: 0,
  legends: [
    {
      legend_id: 30,
      legend_name_key: "val",
      damagedealt: "317",
      damagetaken: "458",
      kos: 0,
      falls: 3,
      suicides: 0,
      teamkos: 0,
      matchtime: 155,
      games: 3,
      wins: 0,
      damageunarmed: "15",
      damagethrownitem: "1",
      damageweaponone: "77",
      damageweapontwo: "224",
      damagegadgets: "0",
      kounarmed: 0,
      kothrownitem: 0,
      koweaponone: 0,
      koweapontwo: 0,
      kogadgets: 0,
      timeheldweaponone: 38,
      timeheldweapontwo: 97,
      xp: 97,
      level: 1,
      xp_percentage: 0.46190476190476
    },
    {
      legend_id: 29,
      legend_name_key: "wu shang",
      damagedealt: "0",
      damagetaken: "0",
      kos: 0,
      falls: 0,
      suicides: 0,
      teamkos: 0,
      matchtime: 0,
      games: 0,
      wins: 0,
      damageunarmed: "0",
      damagethrownitem: "0",
      damageweaponone: "0",
      damageweapontwo: "0",
      damagegadgets: "0",
      kounarmed: 0,
      kothrownitem: 0,
      koweaponone: 0,
      koweapontwo: 0,
      kogadgets: 0,
      timeheldweaponone: 0,
      timeheldweapontwo: 0,
      xp: 260,
      level: 2,
      xp_percentage: 0.13586956521739
    }
  ],
  clan: {
    clan_name: "Blue Mammoth Games",
    clan_id: 1,
    clan_xp: "86962",
    personal_xp: 4492
  }
}
```
</details>

---

#### .fetchPlayerRanked(brawlhalla_id)
> *Uses One Brawlhalla API Call*

Retrieves the stats of a specific player.

**Brawlhalla ID**

The unique ID of a player. *Can either be an Integer or a String.*

Example:

```js
let brawlhalla_id = 4281946; // Or '4281946'
```

**Usage**

Using Promises

```js
bh_api.fetchPlayerRanked(brawlhalla_id)
    .then(ranked => {
        console.log(ranked); // Do stuff
    })
    .catch(error => console.error(error));
```

Using Async/Await

```js
async function getPlayerRanked(brawlhalla_id) {
    try  {
        const ranked = await bh_api.fetchPlayerRanked(brawlhalla_id);
        console.log(ranked); // Do stuff
    }
    catch(error) {
        console.error(error);
    }
}
```

**Output**
<details>
  <summary>The above function returns an object structured like this</summary>

```js
{
  name: "bmg | dan",
  brawlhalla_id: 2,
  rating: 1745,
  peak_rating: 1792,
  tier: "Platinum 2",
  wins: 207,
  games: 391,
  region: "US-E",
  global_rank: 5698,
  region_rank: 1644,
  legends: [
    {
      legend_id: 4,
      legend_name_key: "cassidy",
      rating: 1736,
      peak_rating: 1792,
      tier: "Platinum 1",
      wins: 161,
      games: 300
    },
    {
      legend_id: 21,
      legend_name_key: "barraza",
      rating: 1640,
      peak_rating: 1640,
      tier: "Gold 5",
      wins: 41,
      games: 77
    }
  ],
  "2v2": [
    {
      brawlhalla_id_one: 2,
      brawlhalla_id_two: 9,
      rating: 793,
      peak_rating: 793,
      tier: "Tin 2",
      wins: 1,
      games: 1,
      teamname: "[BMG] Dan+[BMG] Dolchay",
      region: 2,
      global_rank: 423974
    },
    {
      brawlhalla_id_one: 1,
      brawlhalla_id_two: 2,
      rating: 789,
      peak_rating: 789,
      tier: "Tin 2",
      wins: 1,
      games: 1,
      teamname: "[BMG] Tyveris+[BMG] Dan",
      region: 2,
      global_rank: 430291
    }
  ]
}
```
</details>

---

### Clans

#### .fetchClan(clan_id)
> *Uses One Brawlhalla API Call*

Retrieves the stats of a specific player.

**Clan ID**

The unique ID of a Clan. *Can either be an Integer or a String.*

Example:

```js
let clan_id = 955295; // or '955295'
```

**Usage**

Using Promises

```js
bh_api.fetchClan(clan_id)
    .then(clan => {
        console.log(clan); // Do stuff
    })
    .catch(error => console.error(error));
```

Using Async/Await

```js
async function getClan(clan_id) {
    try  {
        const clan = await bh_api.fetchClan(clan_id);
        console.log(clan); // Do stuff
    }
    catch(error) {
        console.error(error);
    }
}
```

**Output**
<details>
  <summary>The above function returns an object structured like this</summary>

```js
{
  clan_id: 1,
  clan_name: "Blue Mammoth Games",
  clan_create_date: 1464206400,
  clan_xp: "86962",
  clan: [
    {
      brawlhalla_id: 3,
      name: "[BMG] Chill Penguin X",
      rank: "Leader",
      join_date: 1464206400,
      xp: 6664
    },
    {
      brawlhalla_id: 2,
      name: "bmg | dan",
      rank: "Officer",
      join_date: 1464221047,
      xp: 4492
    }
  ]
}
```
</details>

---

### Static Data

#### .fetchLegend(legend_id)
> *Uses One Brawlhalla API Call*

Retrieves the static info about a specific legend. Legend ID can be omitted and will be assigned the default value of `'all'`.

**Legend ID**

The unique ID of a Legend. *Can either be an Integer or a String.*
Legend ID can also take the value `'all'` to retrieve info about all legends.

Example:

```js
let legend_id = 4; // or '4'
```

<details>
<summary>Legend IDs</summary>

> **Bödvar**: 3  
> **Cassidy**: 4  
> **Orion**: 5  
> **Lord Vraxx**: 6  
> **Gnash**: 7  
> **Queen Nai**: 8  
> **Hattori**: 10  
> **Sir Roland**: 11  
> **Scarlet**: 12  
> **Thatch**: 13  
> **Ada**: 14  
> **Sentinel**: 15  
> **Lucien**: 9  
> **Teros**: 16  
> **Brynn**: 19  
> **Asuri**: 20  
> **Barraza**: 21  
> **Ember**: 18  
> **Azoth**: 23  
> **Koji**: 24  
> **Ulgrim**: 22  
> **Diana**: 25  
> **Jhala**: 26  
> **Kor**: 28  
> **Wu Shang**: 29  
> **Val**: 30  
> **Ragnir**: 31  
> **Cross**: 32  
> **Mirage**: 33  
> **Nix**: 34  
> **Mordex**: 35  
> **Yumiko**: 36  
> **Artemis**: 37  
> **Caspian**: 38  
> **Sidra**: 39  
> **Xull**: 40  
> **Kaya**: 42  
> **Isaiah**: 41  
> **Jiro**: 43  
> **Lin Fei**: 44  
> **Zariel**: 45  
> **Rayman**: 46  
> **Dusk**: 47  
> **Fait**: 48  
> **Thor**: 49  
> **Petra**: 50  
> **Vector**: 51  
> **Volkov**: 52

</details>

**Usage**

Using Promises

```js
bh_api.fetchLegend(legend_id)
    .then(legend => {
        console.log(legend); // Do stuff
    })
    .catch(error => console.error(error));
```

Using Async/Await

```js
async function getLegend(legend_id) {
    try  {
        const legend = await bh_api.fetchLegend(legend_id);
        console.log(legend); // Do stuff
    }
    catch(error) {
        console.error(error);
    }
}
```

**Output**
<details>
  <summary>The above function returns an object structured like this</summary>

All Legends

```js
[
  {
    legend_id: 3,
    legend_name_key: "bodvar",
    bio_name: "B\u00f6dvar",
    bio_aka: "The Unconquered Viking, The Great Bear",
    weapon_one: "Hammer",
    weapon_two: "Sword",
    strength: "6",
    dexterity: "6",
    defense: "5",
    speed: "5"
  },
  {
    legend_id: 4,
    legend_name_key: "cassidy",
    bio_name: "Cassidy",
    bio_aka: "The Marshal of the Old West",
    weapon_one: "Pistol",
    weapon_two: "Hammer",
    strength: "6",
    dexterity: "8",
    defense: "4",
    speed: "4"
  }
]
```

Specific Legend

```js
{
  legend_id: 3,
  legend_name_key: "bodvar",
  bio_name: "B\u00f6dvar",
  bio_aka: "The Unconquered Viking, The Great Bear",
  bio_quote:
    '"I speak, you noble vikings, of a warrior who surpassed you all. I tell of a great bear-man who overcame giants and armies, and of how he came to leave our world and challenge the Gods."',
  bio_quote_about_attrib:
    '"                   -The Saga of B\u00f6dvar Bearson, first stanza"',
  bio_quote_from:
    "\"Listen you nine-mothered bridge troll, I'm coming in, and the first beer I'm drinking is the one in your fist.\"",
  bio_quote_from_attrib:
    '"                   -B\u00f6dvar to Heimdall, guardian of the gates of Asgard"',
  bio_text:
    "Born of a viking mother and bear father, B\u00f6dvar grew up feared and mistrusted by his own people.\nB\u00f6dvar's first nemesis was the terrible giant bear Grothnar, his own brother. By defeating Grothnar in a battle that lasted seven days, B\u00f6dvar chose to side with humanity and became the protector of the people of the north. He led his Skandian people against the Witch Queen of Helheim, slew the White Dragon Sorcerer, and lived the life of an all-conquering hero.\nAfter he single-handedly ended the Giant Wars by trapping the fire giant king in his own volcano, B\u00f6dvar sensed his work was done. But he felt doomed to never be taken by the Valkyries to Valhalla because he could never manage to be defeated in battle. So he travelled to Asgard himself, broke down the doors, and let himself in.\nValhalla is everything B\u00f6dvar hoped - an endless reward of feasting and fighting, with himself among its greatest champions.",
  bot_name: "B\u00f6tvar",
  weapon_one: "Hammer",
  weapon_two: "Sword",
  strength: "6",
  dexterity: "6",
  defense: "5",
  speed: "5"
}
```
</details>