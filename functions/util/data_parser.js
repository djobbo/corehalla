const moment = require('moment');
const moment_format = require('moment-duration-format');
const clean_string = require('./clean_string');

const regions = ['all', 'us-e', 'eu', 'sea', 'brz', 'aus', 'us-w', 'jpn'];

function parsePlayerStats(playerStats, playerRank, legends_data) {
    return new Promise((resolve, reject) => {
        var player = {
            id: playerStats.brawlhalla_id,
            name: clean_string(playerStats.name),
            region: playerRank.region,
            level: playerStats.level,
            xp: playerStats.xp,
            xp_percentage: playerStats.xp_percentage,
            kos: 0,
            falls: 0,
            suicides: 0,
            teamkos: 0,
            matchtime: 0,
            damage: 0,
            global: {
                games: playerStats.games,
                wins: playerStats.wins,
                losses: playerStats.games - playerStats.wins,
                winrate: Math.round(playerStats.wins / playerStats.games * 1000) / 10
            },
            season: {
                games: playerRank.games,
                wins: playerRank.wins,
                losses: playerRank.games - playerRank.wins,
                rating: playerRank.rating,
                peak_rating: playerRank.peak_rating,
                tier: playerRank.tier,
                winrate: Math.round(playerRank.wins / playerRank.games * 1000) / 10
            },
            clan: playerStats.clan ? {
                in_clan: true,
                id: playerStats.clan.clan_id,
                name: clean_string(playerStats.clan.clan_name)
            } : { in_clan: false },
            teams: [],
            legends: [],
            weapons: {}
        }

        //Teams
        if (playerRank['2v2']) {
            player.teams = parse2v2TeamsStats(player.id, player.name, playerRank['2v2']);
            player.teams.sort((a, b) => b.rating - a.rating || b.peak_rating - a.peak_rating || b.name.localeCompare(a.name));
        }

        for (var i = 0; i < legends_data.length; i++) {
            var legendStats = playerStats.legends.find(l => {
                return l.legend_id === legends_data[i].legend_id;
            });
            var legendRank = playerRank.legends.find(l => {
                return l.legend_id === legends_data[i].legend_id;
            });

            var legend_name_bio = legends_data[i].bio_name;
            var weapon_one = legends_data[i].weapon_one;
            var weapon_two = legends_data[i].weapon_two;

            if (!player.unarmed) {
                player.unarmed = {
                    time_held: 0,
                    damage: 0,
                    kos: 0
                }
            }

            if (!player.weapons[weapon_one]) {
                player.weapons[weapon_one] = {
                    name: weapon_one,
                    time_held: 0,
                    global: {
                        games: 0,
                        wins: 0,
                        losses: 0
                    },
                    damage: 0,
                    kos: 0,
                    season: {
                        games: 0,
                        wins: 0,
                        losses: 0,
                        highest_rating: 0,
                        highest_rating_legend: 'None',
                        highest_peak_rating: 0,
                        highest_peak_rating_legend: 'None'
                    }
                }
            }

            if (!player.weapons[weapon_two]) {
                player.weapons[weapon_two] = {
                    name: weapon_two,
                    time_held: 0,
                    global: {
                        games: 0,
                        wins: 0,
                        losses: 0
                    },
                    damage: 0,
                    kos: 0,
                    season: {
                        games: 0,
                        wins: 0,
                        losses: 0,
                        highest_rating: 0,
                        highest_rating_legend: 'None',
                        highest_peak_rating: 0,
                        highest_peak_rating_legend: 'None'
                    }
                }
            }

            var legend = {
                id: legends_data[i].legend_id,
                name_key: legends_data[i].legend_name_key,
                name: legend_name_bio
            }

            if (legendStats) {
                legend.level = legendStats.level;
                legend.xp = legendStats.xp;
                legend.xp_percentage = legendStats.xp_percentage;
                legend.kos = legendStats.kos;
                legend.falls = legendStats.falls;
                legend.suicides = legendStats.suicides;
                legend.teamkos = legendStats.teamkos;
                legend.matchtime = legendStats.matchtime;
                legend.matchtime_format = moment.duration(legendStats.matchtime, 'seconds').format('hh[h] mm[m] ss[s]');
                legend.damage = parseInt(legendStats.damageweaponone) + parseInt(legendStats.damageweapontwo) + parseInt(legendStats.damageunarmed) + parseInt(legendStats.kogadgets) + parseInt(legendStats.kothrownitem);
                legend.dps = Math.round(legend.damage / legend.matchtime * 10) / 10;
                legend.ttk = Math.round(legend.matchtime / legend.kos * 10) / 10;
                legend.ttf = Math.round(legend.matchtime / legend.falls * 10) / 10;
                legend.global = {
                    games: legendStats.games,
                    wins: legendStats.wins,
                    losses: legendStats.games - legendStats.wins,
                    winrate: Math.round(legendStats.wins / legendStats.games * 1000) / 10
                };
                legend.suicide_rate = Math.round(legend.global.games / legend.suicides * 10) / 10;
                legend.game_length = Math.round(legend.matchtime / legend.global.games * 10) / 10;
                legend.kos_per_game = Math.round(legend.kos / legend.global.games * 10) / 10;
                legend.falls_per_game = Math.round(legend.falls / legend.global.games * 10) / 10;
                legend.weapons = {
                    weapon_one: {
                        name: weapon_one,
                        time_held: legendStats.timeheldweaponone,
                        time_held_format: moment.duration(legendStats.timeheldweaponone, 'seconds').format('hh[h] mm[m] ss[s]'),
                        damage: legendStats.damageweaponone,
                        kos: legendStats.koweaponone
                    },
                    weapon_two: {
                        name: weapon_two,
                        time_held: legendStats.timeheldweapontwo,
                        time_held_format: moment.duration(legendStats.timeheldweapontwo, 'seconds').format('hh[h] mm[m] ss[s]'),
                        damage: legendStats.damageweapontwo,
                        kos: legendStats.koweapontwo
                    },
                    unarmed: {
                        time_held: legendStats.matchtime - (legendStats.timeheldweaponone + legendStats.timeheldweapontwo),
                        time_held_format: moment.duration(legendStats.matchtime - (legendStats.timeheldweaponone + legendStats.timeheldweapontwo), 'seconds').format('hh[h] mm[m] ss[s]'),
                        damage: legendStats.damageunarmed,
                        kos: legendStats.kounarmed
                    },
                    gadgets: {
                        damage: legendStats.damagegadgets,
                        kos: legendStats.kogadgets
                    },
                    weapon_throws: {
                        damage: legendStats.damagethrownitem,
                        kos: legendStats.kothrownitem
                    }
                };

                player.unarmed.time_held += legend.weapons.unarmed.time_held;
                player.unarmed.damage += parseInt(legend.weapons.unarmed.damage);
                player.unarmed.kos += legend.weapons.unarmed.kos;

                player.weapons[weapon_one].time_held += legend.weapons.weapon_one.time_held;
                player.weapons[weapon_one].global.games += legend.global.games;
                player.weapons[weapon_one].global.wins += legend.global.wins;
                player.weapons[weapon_one].global.losses += legend.global.losses;
                player.weapons[weapon_one].damage += parseInt(legend.weapons.weapon_one.damage);
                player.weapons[weapon_one].kos += legend.weapons.weapon_one.kos;

                player.weapons[weapon_two].time_held += legend.weapons.weapon_two.time_held;
                player.weapons[weapon_two].global.games += legend.global.games;
                player.weapons[weapon_two].global.wins += legend.global.wins;
                player.weapons[weapon_two].global.losses += legend.global.losses;
                player.weapons[weapon_two].damage += parseInt(legend.weapons.weapon_two.damage);
                player.weapons[weapon_two].kos += legend.weapons.weapon_two.kos;

                player.kos += legend.kos;
                player.falls += legend.falls;
                player.suicides += legend.suicides;
                player.teamkos += legend.teamkos;
                player.matchtime += legend.matchtime;
                player.damage += legend.damage;
            }
            else {
                legend.level = 0;
                legend.xp = 0;
                legend.xp_percentage = 0;
                legend.kos = 0;
                legend.falls = 0;
                legend.suicides = 0;
                legend.teamkos = 0;
                legend.matchtime = 0;
                legend.matchtime_format = '0s';
                legend.damage = 0;
                legend.dps = 'N/A';
                legend.ttk = 'N/A';
                legend.ttf = 'N/A';
                legend.global = {
                    games: 0,
                    wins: 0,
                    losses: 0,
                    winrate: 'N/A'
                };
                legend.suicide_rate = 'N/A';
                legend.game_length = 'N/A';
                legend.kos_per_game = 'N/A';
                legend.falls_per_game = 'N/A';
                legend.weapons = {
                    weapon_one: {
                        name: weapon_one,
                        time_held: 0,
                        time_held_format: '0s',
                        damage: 0,
                        kos: 0
                    },
                    weapon_two: {
                        name: weapon_two,
                        time_held: 0,
                        time_held_format: '0s',
                        damage: 0,
                        kos: 0
                    },
                    unarmed: {
                        time_held: 0,
                        time_held_format: '0s',
                        damage: 0,
                        kos: 0
                    },
                    gadgets: {
                        damage: 0,
                        kos: 0
                    },
                    weapon_throws: {
                        damage: 0,
                        kos: 0
                    }
                };
            }

            if (legendRank) {
                legend.season = {
                    games: legendRank.games,
                    wins: legendRank.wins,
                    losses: legendRank.games - legendRank.wins,
                    rating: legendRank.rating,
                    peak_rating: legendRank.peak_rating,
                    tier: legendRank.tier,
                    winrate: Math.round(legendRank.wins / legendRank.games * 1000) / 10
                };

                player.weapons[weapon_one].season.games += legendRank.games;
                player.weapons[weapon_one].season.wins += legendRank.wins;
                player.weapons[weapon_one].season.losses += legendRank.games - legendRank.wins;

                if (player.weapons[weapon_one].season.highest_rating < legendRank.rating) {
                    player.weapons[weapon_one].season.highest_rating = legendRank.rating;
                    player.weapons[weapon_one].season.highest_rating_legend = legend_name_bio;
                }
                else if (player.weapons[weapon_one].season.highest_rating === legendRank.rating) {
                    player.weapons[weapon_one].season.highest_rating_legend += ' • ' + legend_name_bio;
                }

                if (player.weapons[weapon_one].season.highest_peak_rating < legendRank.rating) {
                    player.weapons[weapon_one].season.highest_peak_rating = legendRank.rating;
                    player.weapons[weapon_one].season.highest_peak_rating_legend = legend_name_bio;
                }
                else if (player.weapons[weapon_one].season.highest_peak_rating === legendRank.rating) {
                    player.weapons[weapon_one].season.highest_peak_rating_legend += ' • ' + legend_name_bio;
                }

                player.weapons[weapon_two].season.games += legendRank.games;
                player.weapons[weapon_two].season.wins += legendRank.wins;
                player.weapons[weapon_two].season.losses += legendRank.games - legendRank.wins;

                if (player.weapons[weapon_two].season.highest_rating < legendRank.rating) {
                    player.weapons[weapon_two].season.highest_rating = legendRank.rating;
                    player.weapons[weapon_two].season.highest_rating_legend = legend_name_bio;
                }
                else if (player.weapons[weapon_two].season.highest_rating === legendRank.rating) {
                    player.weapons[weapon_two].season.highest_rating_legend += ' • ' + legend_name_bio;
                }

                if (player.weapons[weapon_two].season.highest_peak_rating < legendRank.rating) {
                    player.weapons[weapon_two].season.highest_peak_rating = legendRank.rating;
                    player.weapons[weapon_two].season.highest_peak_rating_legend = legend_name_bio;
                }
                else if (player.weapons[weapon_two].season.highest_peak_rating === legendRank.rating) {
                    player.weapons[weapon_two].season.highest_peak_rating_legend += ' • ' + legend_name_bio;
                }
            }
            else {
                legend.season = {
                    games: 0,
                    wins: 0,
                    losses: 0,
                    rating: 750,
                    peak_rating: 750,
                    tier: 'Tin 1 (Unranked)'
                };
            }

            player.legends.push(legend);
        }

        player.legends.sort(function(a, b) {
            return b.xp - a.xp || b.season.rating - a.season.rating || b.season.peak_rating - a.season.peak_rating || b.name.localeCompare(a.name);
        });

        player.weapons = Object.values(player.weapons);
        player.weapons.sort(function(a, b) {
            return b.time_held - a.time_held || b.global.games - a.global.games || b.global.wins - a.global.wins || b.name.localeCompare(a.name);
        });

        for (var i = 0; i < player.weapons.length; i++) {
            player.weapons[i].time_held_format = moment.duration(player.weapons[i].time_held, 'seconds').format('hh[h] mm[m] ss[s]');
            player.weapons[i].global.winrate = player.weapons[i].global.games === 0 ? 'N/A' : Math.round(player.weapons[i].global.wins / player.weapons[i].global.games * 1000) / 10;
            player.weapons[i].season.winrate = player.weapons[i].season.games === 0 ? 'N/A' : Math.round(player.weapons[i].season.wins / player.weapons[i].season.games * 1000) / 10;
            if (player.weapons[i].time_held === 0) {
                player.weapons[i].dps = 'N/A';
                player.weapons[i].ttk = 'N/A';
            }
            else {
                player.weapons[i].dps = Math.round(player.weapons[i].damage / player.weapons[i].time_held * 10) / 10;
                player.weapons[i].ttk = Math.round(player.weapons[i].time_held / player.weapons[i].kos * 10) / 10;
            }
        }

        player.unarmed.time_held_format = moment.duration(player.unarmed.time_held, 'seconds').format('hh[h] mm[m] ss[s]');
        player.matchtime_format = moment.duration(player.matchtime, 'seconds').format('hh[h] mm[m] ss[s]');
        player.dps = Math.round(player.damage / player.matchtime * 10) / 10;
        player.ttk = Math.round(player.matchtime / player.kos * 10) / 10;
        player.ttf = Math.round(player.matchtime / player.falls * 10) / 10;
        player.suicide_rate = Math.round(player.global.games / player.suicides * 10) / 10;
        player.game_length = Math.round(player.matchtime / player.global.games * 10) / 10;
        player.kos_per_game = Math.round(player.kos / player.global.games * 10) / 10;
        player.falls_per_game = Math.round(player.falls / player.global.games * 10) / 10;

        resolve(player);
    });
}

function parseClanStats(clanStats) {
    return new Promise((resolve, reject) => {

        for (var i = 0; i < clanStats.clan.length; i++) {
            clanStats.clan[i].name = clean_string(clanStats.clan[i].name);
            clanStats.clan[i].join_date = moment.unix(clanStats.clan[i].join_date).utc().format("MMMM DD, YYYY");
        }

        var clan = {
            id: clanStats.clan_id,
            name: clanStats.clan_name,
            create_date: moment.unix(clanStats.clan_create_date).utc().format("MMMM DD, YYYY"),
            xp: clanStats.clan_xp,
            leader: clanStats.clan.find(member => {
                return member.rank === 'Leader';
            }),
            officers: clanStats.clan.filter(member => {
                return member.rank === 'Officer';
            }),
            members: clanStats.clan.filter(member => {
                return member.rank === 'Member';
            }),
            recruits: clanStats.clan.filter(member => {
                return member.rank === 'Recruit';
            })
        }

        resolve(clan);
    });
}

function parse2v2TeamsStats(player_id, player_name, teamsStats) {
    var parsedTeams = [];
    for (var i = 0; i < teamsStats.length; i++) {
        var teamname = clean_string(teamsStats[i].teamname);
        parsedTeams.push({
            rank: '-1',
            player_one_id: player_id,
            player_one_name: player_name,
            player_two_id: teamsStats[i].brawlhalla_id_one === player_id ? teamsStats[i].brawlhalla_id_two : teamsStats[i].brawlhalla_id_one,
            player_two_name: teamsStats[i].brawlhalla_id_one === player_id ? teamname.substring(teamname.indexOf('+') + 1) : teamname.substring(0, teamname.indexOf('+')),
            games: teamsStats[i].games,
            wins: teamsStats[i].wins,
            losses: teamsStats[i].games - teamsStats[i].wins,
            rating: teamsStats[i].rating,
            peak_rating: teamsStats[i].peak_rating,
            tier: teamsStats[i].tier,
            region: regions[teamsStats[i].region-1] || 'N/A',
            winrate: Math.round(teamsStats[i].wins / teamsStats[i].games * 1000) / 10
        });
    }
    return parsedTeams;
}


module.exports = {
    parsePlayerStats,
    parseClanStats,
    parse2v2TeamsStats,
}