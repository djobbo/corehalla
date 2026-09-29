import type { ClanRank, RankedRegion, RankedTier, Weapon } from "./constants"

export type Bracket = "1v1" | "2v2"

/** Wider than `Bracket`: `3v3` is v1-only and only ladder paths accept it. */
export type Ladder = "1v1" | "2v2" | "3v3"

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
        tier: RankedTier | null // TOFIX: 'Valhallan' tier is null
        wins: number
        games: number
    }[]
    "2v2": {
        brawlhalla_id_one: number
        brawlhalla_id_two: number
        /** Optional: v0 sends only joined `teamname`; `getTeamPlayers` falls back. */
        name_one?: string
        name_two?: string
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
    tier: RankedTier | null // TOFIX: 'Valhallan' tier is null
    wins: number
    games: number
    region: RankedRegion | Uppercase<RankedRegion>
}

/**
 * Separate from `PlayerRanked`: v0 has no 3v3, and v1's 3v3 mode lacks the
 * account/clan/2v2 fields `PlayerRanked` carries — folding them would force
 * fabricating data.
 */
export type Player3v3Ranked = {
    brawlhalla_id: number
    name: string
    rating: number
    peak_rating: number
    tier: RankedTier | null // TOFIX: 'Valhallan' tier is null
    wins: number
    games: number
    region: RankedRegion | Uppercase<RankedRegion>
}

export type Clan = {
    clan_id: number
    clan_name: string
    clan_create_date: number
    clan_xp: string
    /**
     * Optional: only v1 `/guild/stats` sends `legacy_xp`. Distinct from
     * `clan_xp` (current season); the two do not sum from the roster.
     */
    legacy_xp?: number
    /**
     * Optional: only v1 sends it. Not the roster sum — a clan keeps points of
     * everyone who ever contributed; summing members is a fallback when absent.
     */
    guild_points?: number
    clan: {
        brawlhalla_id: number
        name: string
        rank: ClanRank
        join_date: number
        xp: number
        /**
         * Optional: only v1 `/guild/members` sends it. `undefined` means this
         * source omits points — not the same as a real `0`.
         */
        guild_points?: number
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
    /** Separate names from v1 `players[]` — do not recover from `teamname`. */
    name_one: string
    name_two: string
    /** Display only — never parse it (usernames can contain `+`). */
    teamname: string
    brawlhalla_id_one: number
    brawlhalla_id_two: number
    twitch_name_one?: string
    twitch_name_two?: string
}

/** v1-only; one player per row (3v3 teams are assembled per match). */
export type Ranking3v3 = Ranking & {
    name: string
    brawlhalla_id: number
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
