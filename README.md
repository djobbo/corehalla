# Brawlhalla API Wrapper for Node.js

## Useful links

Brawlhalla API & Keys info: [dev.brawlhalla.com](http://dev.brawlhalla.com)

Corehalla: [corehalla.com](http://corehalla.com)

## Installation

Install via npm:
```
$ npm i corehalla
```

Import the module and connect using your api key:
```js
const bh_api = require('corehalla')('API_KEY');
```

## Methods

### Corehalla's JSON Format
All methods listed below return custom parsed JSON, easier to use than Brawlhalla's default API JSON format.

*Docs on Corehalla's JSON format are being written and will be released soon*

```js
// Custom format methods
fetchLeaderboardFormat(options)
fetchPlayerStatsFormat(brawlhalla_id)
fetchClanStatsFormat(clan_id)
search2v2Teams(player_name, region, maxPlayers)
```

### Leaderboard

**.fetchLeaderboard(options)**
*Uses One Brawlhalla API Call*
```js
var options = {
	bracket: '1v1', // '1v1' or '2v2'
	region: 'all', // 'all', 'us-e', 'us-w', 'eu', 'brz', 'aus', 'sea', 'jap'
	page: 1,
	player_name: ''
}

bh_api.fetchLeaderboard(options).then(leaderboard => {

})
.catch(err => console.log(err));
```

**.fetchLeaderboardFormat(options)**
*Uses One Brawlhalla API Call*
```js
var options = {
	bracket: '1v1', // '1v1' or '2v2'
	region: 'all', // 'all', 'us-e', 'us-w', 'eu', 'brz', 'aus', 'sea', 'jap'
	page: 1,
	player_name: ''
}

bh_api.fetchLeaderboardFormat(options).then(leaderboard => {

})
.catch(err => console.log(err));
```

### Player

**.findPlayer(player_name, options)**
*Uses One Brawlhalla API Call*
```js
var options = {
	perfect_match: false,
	unique: false
}

bh_api.findPlayer('player_name', options).then(player => {

})
.catch(err => console.log(err));
```

**.findPlayerBySteamID(steam_id)**
*Uses One Brawlhalla API Call*
```js
bh_api.findPlayerBySteamID('steam_id').then(player => {

})
.catch(err => console.log(err));
```

**.fetchPlayerStats(brawlhalla_id)**
*Uses One Brawlhalla API Call*
```js
bh_api.fetchPlayerStats('brawlhalla_id').then(player_stats => {

})
.catch(err => console.log(err));
```

**.fetchPlayerRanked(brawlhalla_id)**
*Uses One Brawlhalla API Call*
```js
bh_api.fetchPlayerRanked('brawlhalla_id').then(player_ranked => {

})
.catch(err => console.log(err));
```

**.fetchPlayerStatsFormat(brawlhalla_id)**
*Uses Two Brawlhalla API Calls*
```js
bh_api.fetchPlayerStatsFormat('brawlhalla_id').then(player_stats => {
	// Formatted General and Ranked player stats for easier use
})
.catch(err => console.log(err));
```

### Clan

**.fetchClanStats(clan_id)**
*Uses One Brawlhalla API Call*
```js
bh_api.fetchClanStats('clan_id').then(clan_stats => {

})
.catch(err => console.log(err));
```

**.fetchClanStatsFormat(clan_id)**
*Uses One Brawlhalla API Call*
```js
bh_api.fetchClanStatsFormat('clan_id').then(clan_stats => {
	// Formatted clan stats for easier use
})
.catch(err => console.log(err));
```

### Static Data

**.fetchStaticLegendData(legend_id)**
*Uses One Brawlhalla API Call*
```js
// if legend_id is left blank, or is undefined,
// will return static data for all legends.
bh_api.fetchStaticLegendData('legend_id').then(data => {

})
.catch(err => console.log(err));
```

### 2v2 Search (Beta)

**.search2v2Teams(player_name, region, maxPlayers)**
*Uses (1+maxPlayers) Brawlhalla API Call*
```js
bh_api.search2v2Teams('player_name', 'region', maxPlayers).then(teams => {
	
})
.catch(err => console.log(err));
```