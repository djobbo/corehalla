const axios = require('axios');

module.exports = api_key => {
	var legends_data = [];

	this.fetchLeaderboard = (
		options = { bracket: '1v1', region: 'all', page: '1', name: '' }
	) => {
		return require('./functions/leaderboard/fetchLeaderboard')(
			api_key,
			options
		);
	};

	this.fetchPlayerStats = brawlhalla_id => {
		return require('./functions/players/fetchPlayerStats')(
			api_key,
			brawlhalla_id
		);
	};

	this.fetchPlayerRanked = brawlhalla_id => {
		return require('./functions/players/fetchPlayerRanked')(
			api_key,
			brawlhalla_id
		);
	};

	this.fetchLeaderboardFormat = (
		options = { bracket: '1v1', region: 'all', page: 1, player_name: '' }
	) => {
		return new Promise((resolve, reject) => {
			this.fetchLeaderboard(options)
				.then(rankings => {
					parser
						.parseLeaderboard(rankings, options.bracket === '2v2')
						.then(leaderboard => {
							resolve({ options, leaderboard });
						});
				})
				.catch(err => console.log(err));
		});
	};

	this.fetchCashLeaderboard = () => {
		return new Promise((resolve, reject) => {
			var URI = 'http://www.brawlhalla.com/rankings/cash/';
			rp(URI)
				.then(html => {
					const $ = cheerio.load(html);
					const rows = $('tr').not('#rheader');
					// resolve(data.map(x => parser.parse2v2TeamsStats(x.brawlhalla_id, x.name, x['2v2'])));
					resolve(
						new Array(rows.length).fill({}).map((x, i) => {
							const row = rows.eq(i).children('td');
							return {
								rank: row.eq(1).text(),
								name: row.eq(3).text(),
								earnings: row.eq(4).text()
							};
						})
					);
				})
				.catch(err => console.log(err));
		});
	};

	this.fetchPowerLeaderboard = (bracket = '') => {
		return new Promise((resolve, reject) => {
			var URI = `http://www.brawlhalla.com/rankings/power/${bracket}`;
			rp(URI)
				.then(html => {
					const $ = cheerio.load(html);
					const rows = $('tr').not('#rheader');
					// resolve(data.map(x => parser.parse2v2TeamsStats(x.brawlhalla_id, x.name, x['2v2'])));
					resolve({
						bracket,
						leaderboard: new Array(rows.length)
							.fill({})
							.map((x, i) => {
								const row = rows.eq(i).children('td');
								return {
									rank: row.eq(1).text(),
									name: row.eq(3).text(),
									earnings: row.eq(4).text(),
									top8: row.eq(5).text(),
									top32: row.eq(6).text(),
									gold_medals: row.eq(7).text(),
									silver_medals: row.eq(8).text(),
									bronze_medals: row.eq(9).text()
								};
							})
					});
				})
				.catch(err => console.log(err));
		});
	};

	this.fetchPlayerStatsFormat = brawlhalla_id => {
		return new Promise((resolve, reject) => {
			this.fetchPlayerStats(brawlhalla_id)
				.then(player_stats => {
					this.fetchPlayerRanked(brawlhalla_id)
						.then(player_ranked => {
							if ((legends_data = [])) {
								this.fetchStaticLegendData()
									.then(data => {
										legends_data = data;
										parser
											.parsePlayerStats(
												player_stats,
												player_ranked,
												data
											)
											.then(parsed_data => {
												resolve(parsed_data);
											})
											.catch(err => console.log(err));
									})
									.catch(err => console.log(err));
							} else {
								parser
									.parsePlayerStats(
										player_stats,
										player_ranked,
										legends_data
									)
									.then(parsed_data => {
										resolve(parsed_data);
									})
									.catch(err => console.log(err));
							}
						})
						.catch(err => console.log(err));
				})
				.catch(err => console.log(err));
		});
	};

	this.fetchClanStatsFormat = clan_id => {
		return new Promise((resolve, reject) => {
			fetchClanStats(clan_id)
				.then(clan_stats => {
					parser
						.parseClanStats(clan_stats)
						.then(parsed_data => {
							resolve(parsed_data);
						})
						.catch(err => console.log(err));
				})
				.catch(err => console.log(err));
		});
	};

	this.search2v2Teams = (player_name, region = 'all', max = 3) => {
		return new Promise((resolve, reject) => {
			this.findPlayer(player_name, {
				perfect_match: false,
				unique: false,
				region
			})
				.then(players => {
					var playerCount = Math.min(players.length, max);
					Promise.all(
						Array.apply(null, { length: playerCount }).map((e, i) =>
							this.fetchPlayerRanked(players[i].brawlhalla_id)
						)
					).then(data => {
						resolve({
							options: {
								bracket: '2v2',
								region,
								page: '1',
								player_name
							},
							leaderboard: [].concat
								.apply(
									[],
									data.map(x =>
										parser.parse2v2TeamsStats(
											x.brawlhalla_id,
											x.name,
											x['2v2']
										)
									)
								)
								.sort(
									(a, b) =>
										b.rating - a.rating ||
										b.peak_rating - a.peak_rating ||
										b.player_two_name.localeCompare(
											a.player_two_name
										)
								)
						});
					});
				})
				.catch(err => console.log(err));
		});
	};
	return this;
};
