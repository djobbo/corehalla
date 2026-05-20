import { Schema } from "effect"

import { BrawlhallaId, BrawlhallaName } from "./brawlhalla-id.js"

const PlayerStatsLegend = Schema.Struct({
    legend_id: Schema.Number,
    legend_name_key: Schema.String,
    damagedealt: Schema.String,
    damagetaken: Schema.String,
    kos: Schema.Number,
    falls: Schema.Number,
    suicides: Schema.Number,
    teamkos: Schema.Number,
    matchtime: Schema.Number,
    games: Schema.Number,
    wins: Schema.Number,
    damageunarmed: Schema.String,
    damagethrownitem: Schema.String,
    damageweaponone: Schema.String,
    damageweapontwo: Schema.String,
    damagegadgets: Schema.String,
    kounarmed: Schema.Number,
    kothrownitem: Schema.Number,
    koweaponone: Schema.Number,
    koweapontwo: Schema.Number,
    kogadgets: Schema.Number,
    timeheldweaponone: Schema.Number,
    timeheldweapontwo: Schema.Number,
    xp: Schema.Number,
    level: Schema.Number,
    xp_percentage: Schema.Number,
})

const PlayerStatsClan = Schema.Struct({
    clan_name: Schema.String,
    clan_id: BrawlhallaId,
    clan_xp: Schema.String,
    personal_xp: Schema.Number,
})

export const PlayerStats = Schema.Struct({
    brawlhalla_id: BrawlhallaId,
    name: BrawlhallaName,
    xp: Schema.Number,
    level: Schema.Number,
    xp_percentage: Schema.Number,
    games: Schema.Number,
    wins: Schema.Number,
    damagebomb: Schema.String,
    damagemine: Schema.String,
    damagespikeball: Schema.String,
    damagesidekick: Schema.String,
    hitsnowball: Schema.Number,
    kobomb: Schema.Number,
    komine: Schema.Number,
    kospikeball: Schema.Number,
    kosidekick: Schema.Number,
    kosnowball: Schema.Number,
    legends: Schema.Array(PlayerStatsLegend),
    clan: Schema.optionalKey(PlayerStatsClan),
})

export type PlayerStats = typeof PlayerStats.Type
