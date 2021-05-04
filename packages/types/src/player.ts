import type { RankedTier, RankedRegion, Weapon, BrawlhallaID } from './general';

//#region Player Stats Format
export interface IPlayerStatsFormat {
    id: BrawlhallaID;
    name: string;
    xp: number;
    level: number;
    xpPercentage: number;
    games: number;
    wins: number;
    kos: number;
    falls: number;
    suicides: number;
    teamkos: number;
    matchtime: number;
    damageDealt: number;
    damageTaken: number;
    season: IPlayerSeasonFormat;
    clan: IPlayerClanFormat | undefined;
    legends: ILegendStatsFormat[];
    gadgets: {
        bomb: {
            damage: number;
            kos: number;
        };
        mine: {
            damage: number;
            kos: number;
        };
        spikeball: {
            damage: number;
            kos: number;
        };
        sidekick: {
            damage: number;
            kos: number;
        };
        snowball: {
            hits: number;
            kos: number;
        };
    };
}

export interface IPlayerSeasonFormat {
    rating: number;
    peak: number;
    tier: RankedTier;
    wins: number;
    games: number;
    region: RankedRegion;
    ratingSquash: number;
    totalWins: number;
    bestOverallRating: number;
    teams: I2v2TeamFormat[];
    glory: {
        bestRating: number;
        wins: number;
    };
}

export interface I2v2TeamFormat {
    playerAlias: string;
    teammate: {
        id: number;
        name: string;
    };
    region: RankedRegion;
    season: {
        rating: number;
        peak: number;
        tier: RankedTier;
        wins: number;
        games: number;
        ratingSquash: number;
    };
}

export interface IPlayerClanFormat {
    name: string;
    id: BrawlhallaID;
    xp: string;
    personalXp: number;
}

export interface ILegendStatsFormat {
    id: number;
    name: string;
    xp: number;
    level: number;
    xpPercentage: number;
    games: number;
    wins: number;
    damageDealt: number;
    damageTaken: number;
    kos: number;
    falls: number;
    suicides: number;
    teamkos: number;
    matchtime: number;
    weapons: {
        weaponOne: {
            name: Weapon;
            damage: number;
            kos: number;
            timeHeld: number;
        };
        weaponTwo: {
            name: Weapon;
            damage: number;
            kos: number;
            timeHeld: number;
        };
        unarmed: {
            damage: number;
            kos: number;
            timeHeld: number;
        };
        throws: {
            damage: number;
            kos: number;
        };
        gadgets: {
            damage: number;
            kos: number;
        };
    };
    season: ILegendSeasonFormat;
}

export interface ILegendSeasonFormat {
    rating: number;
    peak: number;
    tier: RankedTier;
    wins: number;
    games: number;
    ratingSquash: number;
}

export interface ILegendWeaponFormat {
    name: Weapon;
    legends: ILegendStatsFormat[];
}

export interface IWeaponStatsFormat {
    name: Weapon;
    level: number;
    xp: number;
    matchtime: number;
    damageDealt: number;
    kos: number;
    timeHeld: number;
    season: {
        ratingAcc: number;
        peakAcc: number;
        bestRating: number;
        peak: number;
        games: number;
        wins: number;
    };
    legends: IWeaponLegendFormat[];
}

export interface IWeaponLegendFormat {
    id: number;
    name: string;
    damageDealt: number;
    kos: number;
    matchtime: number;
    games: number;
    wins: number;
    xp: number;
    level: number;
    weapon: {
        damage: number;
        kos: number;
        timeHeld: number;
    };
    season: ILegendSeasonFormat;
}
//#endregion
