import type { ClanRank, RankedRegion, RankedTier, Weapon } from "./constants"

export type Bracket = "1v1" | "2v2"

/**
 * A bracket that exists as a ranked ladder.
 *
 * Wider than `Bracket`, which is the legacy client's vocabulary and also what
 * power rankings take: `3v3` is served by v1 only, so only the ladder paths
 * accept it.
 */
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
        /**
         * Optional because v0 does not send them — it ships only the joined
         * `teamname`. Populated where a source provides separate names, and
         * `getTeamPlayers` is the single place that falls back.
         */
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
 * A player's 3v3 ranked record.
 *
 * A sibling of {@link PlayerRanked} rather than a `"3v3"` field on it, because
 * the two come from different upstreams and neither can answer for the other:
 * `PlayerRanked` is the legacy v0 payload, which has no 3v3 mode at all, while
 * this comes from v1's `mode=ranked_3v3`, which returns none of the account,
 * clan or 2v2 data `PlayerRanked` carries. Folding it in as a field would force
 * the v0 mapper to fabricate a record it cannot fetch.
 *
 * Shaped like a row of `PlayerRanked["legends"]` — rating, peak, wins, games,
 * tier — rather than like the ladder's {@link Ranking3v3}, which additionally
 * carries a `rank`. A player payload's only rank is v1's `region_ranks`, and
 * that is empty for everyone outside the top of a region, so it is not a field
 * the UI can rely on.
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
     * The clan's own guild-point total.
     *
     * Read, never recomputed. It is **not** the sum of the roster's points: a
     * clan keeps the points of everyone who has ever contributed, so the two
     * disagree — verified live, where guild 9 reports 353,054 here against a
     * 515,331 sum over its current members, and the leaderboard's top guild
     * reports 14,425,367 against 13,744,590. Summing the members is a fallback
     * for when this is absent, not a way to derive it.
     *
     * Optional for the same reason as the members' `guild_points`: v1's
     * `/guild/stats` always sends it, while the legacy `/clan/:id` payload is
     * cast to this type without a mapper and has no such field.
     */
    guild_points?: number
    clan: {
        brawlhalla_id: number
        name: string
        rank: ClanRank
        join_date: number
        xp: number
        /**
         * The member's guild points: their share of the clan's score, a
         * separate figure from the `xp` that levels the clan.
         *
         * Optional because the two upstreams disagree, and only one of them can
         * be normalised. v1's `/guild/members` always sends it — verified live,
         * where every member of an active guild carries a non-zero value —
         * while the legacy `/clan/:id` omits the key entirely and is cast
         * straight to this type with no mapper, so there is nowhere to fill it
         * in.
         *
         * `undefined` therefore means "this source does not report points",
         * and that is not the same as a real `0`, which is common enough to be
         * worth showing: guild 9's whole roster is genuinely at zero.
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
    /**
     * The two players' names, separately.
     *
     * v1 sends `players[]` with one username per member, so these come straight
     * off the wire rather than being recovered from `teamname`. That recovery
     * is the bug this replaces: a username containing a `+` splits into the
     * wrong halves, which is a defect the legacy payload is known for and which
     * every consumer used to inherit by having no other option.
     */
    name_one: string
    name_two: string
    /** The two names joined with `+`. Display only — never parse it. */
    teamname: string
    brawlhalla_id_one: number
    brawlhalla_id_two: number
    twitch_name_one?: string
    twitch_name_two?: string
}

/**
 * A 3v3 ladder row.
 *
 * v1-only: the legacy API exposes no 3v3 mode, so unlike the other two ladders
 * this one has no fallback source.
 *
 * Shaped like `Ranking1v1`, not like `Ranking2v2`, and that is a property of the
 * mode rather than a modelling choice: v1's 3v3 ladder carries **one player per
 * row**, because 3v3 is a solo queue whose teams are assembled per match — there
 * is no persistent trio to represent. Verified against the live endpoint, where
 * every row has `players.length === 1`.
 */
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
