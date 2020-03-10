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

Returns an array of rankings ordered and paginated 50 at a time.

**Options**

The options object contains 4 fields defining which section of the ranked leaderboard is sent back. Some/all options can be ommited and will be assigned a default value.
PARAMETER | DESCRIPTION | DEFAULT VALUE
--- | --- | ---
**`bracket`** | Either `'1v1'` or `'2v2'`. | `'1v1'`
**`region`** | The region from this subset `'us-e'`, `'eu'`, `'sea'`, `'brz'`, `'aus'`, `'us-w'`, `'jpn'`. For Global region, use `'all'`. | `'all'`
**`page`** | The page number requested. | `1`
**`player_name`** | The ingame name to query against. Name searching must start with exact match. | `''`

Example:

```js
let options = {
	bracket: '2v2',
	region: 'eu',
	page: 3,
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
async function getRankings() {
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

The above function returns JSON structured like this

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

---

### Players

### Clans

### Static Data