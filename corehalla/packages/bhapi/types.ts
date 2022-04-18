import type { ClanRank, RankedRegion, RankedTier, Weapon } from "./constants"

export type PlayerStats = {
    brawlhalla_id: number
    name: string
    xp: number
    level: number
    xp_percentage: number
    games: number
    wins: number
    damagebomb: string
    damagemine: string
    damagespikeball: string
    damagesidekick: string
    hitsnowball: number
    kobomb: number
    komine: number
    kospikeball: number
    kosidekick: number
    kosnowball: number
    legends: {
        legend_id: number
        legend_name_key: string
        damagedealt: string
        damagetaken: string
        kos: number
        falls: number
        suicides: number
        teamkos: number
        matchtime: number
        games: number
        wins: number
        damageunarmed: string
        damagethrownitem: string
        damageweaponone: string
        damageweapontwo: string
        damagegadgets: string
        kounarmed: number
        kothrownitem: number
        koweaponone: number
        koweapontwo: number
        kogadgets: number
        timeheldweaponone: number
        timeheldweapontwo: number
        xp: number
        level: number
        xp_percentage: number
    }[]
    clan?: {
        clan_name: string
        clan_id: number
        clan_xp: string
        personal_xp: number
    }
}

export type PlayerRanked = {
    name: string
    brawlhalla_id: number
    global_rank: number
    region_rank: number
    legends: {
        legend_id: number
        legend_name_key: string
        rating: number
        peak_rating: number
        tier: RankedTier
        wins: number
        games: number
    }[]
    "2v2": {
        brawlhalla_id_one: number
        brawlhalla_id_two: number
        rating: number
        peak_rating: number
        tier: RankedTier
        wins: number
        games: number
        teamname: string
        region: number
        global_rank: number
    }[]
    rating: number
    peak_rating: number
    tier: RankedTier
    wins: number
    games: number
    region: RankedRegion | Uppercase<RankedRegion>
}

export type Clan = {
    clan_id: number
    clan_name: string
    clan_create_date: number
    clan_xp: string
    clan: {
        brawlhalla_id: number
        name: string
        rank: ClanRank
        join_date: number
        xp: number
    }[]
}

export type Ranking = {
    rank: number
    rating: number
    tier: RankedTier
    games: number
    wins: number
    region: RankedRegion | Uppercase<RankedRegion>
    peak_rating: number
}

export type Ranking1v1 = Ranking & {
    name: string
    brawlhalla_id: number
    best_legend: number
    best_legend_games: number
    best_legend_wins: number
    twitch_name?: string
}

export type Ranking2v2 = Ranking & {
    teamname: string
    brawlhalla_id_one: number
    brawlhalla_id_two: number
    twitch_name_one?: string
    twitch_name_two?: string
}

export type Legend = {
    legend_id: number
    legend_name_key: string
    bio_name: string
    bio_aka: string
    weapon_one: Weapon
    weapon_two: Weapon
    strength: string
    dexterity: string
    defense: string
    speed: string
}
