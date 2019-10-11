const _ = require('lodash');

const staticLegendsData = require('../../util/static-data/staticLegendsData.json');

const { winrate, dps, ttk, suicide_rate, avg_game_length, avg_kos_per_game } = require('../../util/calculations');
const formatTime = require('../../util/formatTime');

// TODO: fix '00s' problem => '0s' && null props on non-played legends

// TODO: Stats: Prefered weapon, for each weapon: hold percent

module.exports = (legendsStats) => {
    return new Promise((resolve, reject) => {
        const unifiedLegendsData =
            _.orderBy(
                _.map(
                    _.map(staticLegendsData, (item) => {
                        return _.merge(
                            item,
                            _.find(legendsStats, { 'legend_id': item.legend_id })
                        )
                    }),
                    (legend) => {
                        return {
                            legend_id: legend.legend_id,
                            legend_name_key: legend.legend_name_key,
                            name: legend.bio_name,
                            aka: legend.bio_aka,
                            stats: {
                                strength: legend.strength,
                                dexterity: legend.dexterity,
                                defense: legend.defense,
                                speed: legend.speed
                            },
                            level: legend.level || 0,
                            xp: legend.xp || 0,
                            xp_percentage: legend.xp_percentage || 0,
                            kos: legend.kos || 0,
                            falls: legend.falls || 0,
                            suicides: legend.suicides || 0,
                            team_kos: legend.teamkos || 0,
                            matchtime: legend.matchtime || 0,
                            matchtime_format: formatTime(legend.matchtime),
                            damage_dealt: legend.damagedealt || 0,
                            damage_taken: legend.damagetaken || 0,
                            games: legend.games || 0,
                            wins: legend.wins || 0,
                            losses: (legend.games - legend.wins) || 0,
                            unarmed: {
                                damage: legend.damageunarmed || 0,
                                kos: legend.kounarmed || 0,
                                // TODO: cache time unarmed instead of repeating multiple time
                                time_held: legend.matchtime - (legend.timeheldweaponone + legend.timeheldweapontwo) || 0,
                                time_held_format: formatTime(legend.matchtime - (legend.timeheldweaponone + legend.timeheldweapontwo)),
                                computed: {
                                    dps: dps(legend.damageunarmed, (legend.matchtime - (legend.timeheldweaponone + legend.timeheldweapontwo)), 1),
                                    avg_damage_per_game: avg_kos_per_game(legend.damageunarmed, legend.games, 1),
                                    ttk: ttk(legend.kounarmed, (legend.matchtime - (legend.timeheldweaponone + legend.timeheldweapontwo)), 1),
                                    ttk_format: formatTime(ttk(legend.kounarmed, (legend.matchtime - (legend.timeheldweaponone + legend.timeheldweapontwo)), 1)),
                                    avg_kos_per_game: avg_kos_per_game(legend.kounarmed, legend.games, 1),
                                }
                            },
                            throws: {
                                damage: legend.damagethrownitem || 0,
                                kos: legend.kothrownitem || 0,
                                computed: {
                                    avg_damage_per_game: avg_kos_per_game(legend.damagethrownitem, legend.games, 1),
                                    avg_kos_per_game: avg_kos_per_game(legend.kothrownitem, legend.games, 1),
                                }
                            },
                            weapon_one: {
                                name: legend.weapon_one || 0,
                                damage: legend.damageweaponone || 0,
                                kos: legend.koweaponone || 0,
                                time_held: legend.timeheldweaponone || 0,
                                time_held_format: formatTime(legend.timeheldweaponone),
                                computed: {
                                    dps: dps(legend.damageweaponone, legend.timeheldweaponone, 1),
                                    avg_damage_per_game: avg_kos_per_game(legend.damageweaponone, legend.games, 1),
                                    ttk: ttk(legend.koweaponone, legend.timeheldweaponone, 1),
                                    ttk_format: formatTime(ttk(legend.koweaponone, legend.timeheldweaponone, 1)),
                                    avg_kos_per_game: avg_kos_per_game(legend.koweaponone, legend.games, 1),
                                }
                            },
                            weapon_two: {
                                name: legend.weapon_two || 0,
                                damage: legend.damageweapontwo || 0,
                                kos: legend.koweapontwo || 0,
                                time_held: legend.timeheldweapontwo || 0,
                                time_held_format: formatTime(legend.timeheldweapontwo),
                                computed: {
                                    dps: dps(legend.damageweapontwo, legend.timeheldweapontwo, 1),
                                    avg_damage_per_game: avg_kos_per_game(legend.damageweapontwo, legend.games, 1),
                                    ttk: ttk(legend.koweapontwo, legend.timeheldweapontwo, 1),
                                    ttk_format: formatTime(ttk(legend.koweapontwo, legend.timeheldweapontwo, 1)),
                                    avg_kos_per_game: avg_kos_per_game(legend.koweapontwo, legend.games, 1),
                                }
                            },
                            gadgets: {
                                damage: legend.damagegadgets || 0,
                                kos: legend.kogadgets || 0,
                                computed: {
                                    avg_damage_per_game: avg_kos_per_game(legend.damagegadgets, legend.games, 1),
                                    avg_kos_per_game: avg_kos_per_game(legend.kogadgets, legend.games, 1),
                                }
                            },
                            computed: {
                                winrate: winrate(legend.wins, legend.games, 1),
                                dps: {
                                    dealt: dps(legend.damagedealt, legend.matchtime, 1),
                                    taken: dps(legend.damagetaken, legend.matchtime, 1),
                                },
                                ttk: ttk(legend.kos, legend.matchtime, 1),
                                ttk_format: formatTime(ttk(legend.falls, legend.matchtime, 1)),
                                ttf: ttk(legend.kos, legend.matchtime, 1),
                                ttf_format: formatTime(ttk(legend.falls, legend.matchtime, 1)),
                                suicide_rate: suicide_rate(legend.suicides, legend.games, 0),
                                avg_game_length: avg_game_length(legend.games, legend.matchtime),
                                avg_game_length_format: formatTime(avg_game_length),
                                avg_kos_per_game: avg_kos_per_game(legend.kos, legend.games, 1),
                                avg_falls_per_game: avg_kos_per_game(legend.falls, legend.games, 1),
                            }
                        }
                    }
                ),
                'matchtime',
                'desc')
        resolve(unifiedLegendsData);
    });
}