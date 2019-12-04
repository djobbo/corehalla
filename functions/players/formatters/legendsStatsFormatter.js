const fs = require('fs');
const convertXML = require('xml-js');
const _ = require('lodash');

const staticLegendsDataXML = fs.readFileSync('functions/util/static-data/HeroTypes.xml');
const staticLegendsData = convertXML.xml2js(staticLegendsDataXML, { compact: true }).HeroTypes.HeroType;

module.exports = (legendsStats, legendsRanked) => {
    return new Promise((resolve, reject) => {
        let legends = [];
        let weapons = [];
        staticLegendsData.forEach(hero => {
            const legendStats = legendsStats ? legendsStats.find(l => l.legend_id.toString() === hero.HeroID._text) || {} : {};
            const legendRanked = legendsRanked ? legendsRanked.find(l => l.legend_id.toString() === hero.HeroID._text) || {} : {};
            let weapon_one = getWeaponStats(
                hero.BaseWeapon1._text,
                legendStats.damageweaponone || 0,
                legendStats.koweaponone || 0,
                legendStats.timeheldweaponone || 0
            );
            let weapon_two = getWeaponStats(
                hero.BaseWeapon2._text,
                legendStats.damageweapontwo || 0,
                legendStats.koweapontwo || 0,
                legendStats.timeheldweapontwo || 0
            );
            let unarmed = getWeaponStats(
                'Unarmed',
                legendStats.damageunarmed || 0,
                legendStats.kounarmed || 0,
                legendStats.matchtime - (legendStats.timeheldweaponone + legendStats.timeheldweapontwo) || 0
            );

            let gadgets = getWeaponStats(
                'Gadgets',
                legendStats.damagegadgets || 0,
                legendStats.kogadgets || 0,
                undefined
            );

            let throws = getWeaponStats(
                'Weapon Throws',
                legendStats.damagethrownitem || 0,
                legendStats.kothrownitem || 0,
                undefined
            );

            let legend = {
                id: hero.HeroID._text,
                name: hero.HeroDisplayName._text,
                overall: {
                    level: legendStats.level || 0,
                    xp: legendStats.xp || 0,
                    xp_percentage: legendStats.xp_percentage || 0,
                    damage: {
                        dealt: legendStats.damagedealt || 0,
                        taken: legendStats.damagetaken || 0
                    },
                    kos: {
                        kills: legendStats.kos || 0,
                        falls: legendStats.falls || 0,
                        suicides: legendStats.suicides || 0,
                        team_kills: legendStats.teamkos || 0
                    },
                    matchTime: legendStats.matchtime || 0,
                    games: {
                        total_games: legendStats.games || 0,
                        wins: legendStats.wins || 0,
                        losses: legendStats.games - legendStats.wins || 0
                    },
                    weapons: { weapon_one, weapon_two, unarmed, gadgets, throws }
                },
                season: {
                    rating: legendRanked.rating || 750,
                    peak_rating: legendRanked.peak_rating || 750,
                    tier: legendRanked.tier || 'Tin 0',
                    games: {
                        total_games: legendRanked.games || 0,
                        wins: legendRanked.wins || 0,
                        losses: legendRanked.games - legendRanked.wins || 0
                    }
                }

            }

            const legendStatsForWeapons = {
                overall: {
                    level: legend.overall.level,
                    xp: legend.overall.xp,
                    matchtime: legend.overall.matchTime,
                    games: legend.overall.games
                },
                season: legend.season
            }

            weapon_one = {...weapon_one, ...legendStatsForWeapons };
            weapon_two = {...weapon_two, ...legendStatsForWeapons };

            weapons = [...weapons, ...[weapon_one, weapon_two, unarmed, gadgets, throws]];
            legends.push(legend);
        });
        weapons = _.values(_.groupBy(weapons, 'name'));
        weapons.forEach((w, i) => {
            weapons[i] = w.reduceRight((prev, item, j) => {
                let weapon = {
                    name: prev.name || item.name,
                    damage_dealt: parseInt(prev.damage_dealt || 0) + parseInt(item.damage_dealt),
                    kills: (prev.kills || 0) + item.kills
                }
                if (item.overall) {
                    weapon.overall = {
                        level: (prev.overall.level || 0) + item.overall.level,
                        xp: (prev.overall.xp || 0) + item.overall.xp,
                        matchtime: (prev.overall.matchTime || 0) + item.overall.matchTime,
                        games: {
                            total_games: (prev.overall.games.total_games || 0) + item.overall.games.total_games,
                            wins: (prev.overall.games.wins || 0) + item.overall.games.wins,
                            losses: (prev.overall.games.losses || 0) + item.overall.games.losses
                        }
                    }
                }
                if (item.season) {
                    weapon.season = {
                        total_rating: (prev.season.total_rating || 0) + item.season.rating,
                        total_peak_rating: (prev.season.total_peak_rating || 0) + item.season.peak_rating,
                        max_rating: (prev.season.max_rating || 0) > item.season.rating ? prev.season.max_rating : item.season.rating, // TODO: Multiple Legends w/ same rating/peak rating?
                        max_peak_rating: (prev.season.max_peak_rating || 0) > item.season.peak_rating ? prev.season.max_peak_rating : item.season.peak_rating, // TODO: Multiple Legends w/ same rating/peak rating?
                        games: {
                            total_games: (prev.season.games.total_games || 0) + item.season.games.total_games,
                            wins: (prev.season.games.wins || 0) + item.season.games.wins,
                            losses: (prev.season.games.losses || 0) + item.season.games.losses
                        }
                    }
                }
                if (item.time_held) {
                    weapon.time_held = (prev.time_held || 0) + item.time_held;
                    if (j == 0) {
                        weapon.computed = {
                            damage_dealt_per_second: (weapon.damage_dealt / weapon.time_held) || 0,
                            time_to_kill: (weapon.time_held / weapon.kills) || '∞',
                            damage_per_kill: (weapon.damage_dealt / weapon.kills) || '∞'
                        }
                    }
                }

                return weapon;
            })
        })
        resolve({ legends, weapons });
    });
}

function getWeaponStats(name, damage_dealt, kills, time_held) {
    return { name, damage_dealt, kills, time_held: time_held };
}