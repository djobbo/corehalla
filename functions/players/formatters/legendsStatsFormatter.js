const fs = require('fs');
const convertXML = require('xml-js');

const staticLegendsDataXML = fs.readFileSync('functions/util/static-data/HeroTypes.xml');
const staticLegendsData = convertXML.xml2js(staticLegendsDataXML, { compact: true });
console.log(staticLegendsData.HeroTypes.HeroType[3].HeroID._text);

module.exports = (legendsStats, legendsRanked) => {
    return new Promise((resolve, reject) => {
        let data = {
            player: {
                damage: {
                    dealt: 0,
                    taken: 0
                },
                kos: {
                    kills: 0,
                    falls: 0,
                    suicides: 0,
                    team_kills: 0
                },
                // matchTime + format
            },
            legends: []
        }
        let weapons = [];
        staticLegendsData.HeroTypes.HeroType.forEach(hero => {
            const legendStats = legendsStats.find(l => l.legend_id.toString() === hero.HeroID._text) || null;
            const legendRanked = legendsRanked.find(l => l.legend_id.toString() === hero.HeroID._text) || null;

            let weapon_one = getWeaponStats(
                hero.BaseWeapon1._text,
                hero.damageweaponone || 0,
                hero.koweaponone || 0,
                hero.timeheldweaponone || 0
            );

            let weapon_two = getWeaponStats(
                hero.BaseWeapon2._text,
                hero.damageweapontwo || 0,
                hero.koweapontwo || 0,
                hero.timeheldweapontwo || 0
            );

            let unarmed = getWeaponStats(
                'Unarmed',
                hero.damageunarmed || 0,
                hero.kounarmed || 0,
                hero.matchtime - (hero.timeheldweaponone + hero.timeheldweapontwo) || 0
            );

            let gadgets = {
                damage_dealt: hero.damagegadgets || 0,
                kills: hero.kogadgets || 0
            };

            let throws = {
                damage_dealt: hero.damagethrownitem || 0,
                kills: hero.kothrownitem || 0
            };

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
                    total_games: legendRanked.games || 0,
                    wins: legendRanked.wins || 0,
                    losses: legendRanked.games - legendRanked.wins || 0
                }

            }

            data.legends.push(legend);
            // TODO: Add XP Level Games W L matchtime
            weapons[hero.BaseWeapon1._text].push(weapon_one);
            weapons[hero.BaseWeapon2._text].push(weapon_two);
            weapons['Unarmed'].push(unarmed);
            weapons['Gadgets'].push(gadgets);
            weapons['Throws'].push(throws);
        });

        let i = 0;
        for (let w in weapons) {
            let weapon = {
                name: w[0].name,
                damage_dealt: w[0].damage_dealt,
                kills: w[0].kills,
                time_held: w[0].time_held
            }
            for (let j = 1; j < w.length; j++) {
                weapon.damage_dealt += w[j].damage_dealt;
                weapon.kills += w[j].kills;
                weapon.time_held += w[j].time_held;
                weapon.damage_dealt += w[j].damage_dealt;
            }
            i++;
        }
        resolve(data);
    });
}

function getWeaponStats(name, damage_dealt, kills, time_held) {
    return { name, damage_dealt, kills, time_held: time_held };
}