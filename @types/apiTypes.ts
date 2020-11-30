import type { ClanRank, RankedRegion, RankedTier } from './general';

//#region API Player Stats
export interface IPlayerStats {
	brawlhalla_id: number;
	name: string;
	xp: number;
	level: number;
	xp_percentage: number;
	games: number;
	wins: number;
	damagebomb: string;
	damagemine: string;
	damagespikeball: string;
	damagesidekick: string;
	hitsnowball: number;
	kobomb: number;
	komine: number;
	kospikeball: number;
	kosidekick: number;
	kosnowball: number;
	legends: ILegendStats[];
	clan: IPlayerClan | undefined;
}

export interface ILegendStats {
	legend_id: number;
	legend_name_key: string;
	damagedealt: string;
	damagetaken: string;
	kos: number;
	falls: number;
	suicides: number;
	teamkos: number;
	matchtime: number;
	games: number;
	wins: number;
	damageunarmed: string;
	damagethrownitem: string;
	damageweaponone: string;
	damageweapontwo: string;
	damagegadgets: string;
	kounarmed: number;
	kothrownitem: number;
	koweaponone: number;
	koweapontwo: number;
	kogadgets: number;
	timeheldweaponone: number;
	timeheldweapontwo: number;
	xp: number;
	level: number;
	xp_percentage: number;
}

export interface IPlayerClan {
	clan_name: string;
	clan_id: number;
	clan_xp: string;
	personal_xp: number;
}
//#endregion

//#region API Player Ranked
export interface IPlayerRanked extends IPlayerSeason {
	name: string;
	brawlhalla_id: number;
	global_rank: number;
	region_rank: number;
	legends: ILegendRanked[];
	'2v2': I2v2Team[];
}

export interface IPlayerSeason {
	rating: number;
	peak_rating: number;
	tier: RankedTier;
	wins: number;
	games: number;
	region: RankedRegion;
}

export interface ILegendRanked {
	legend_id: number;
	legend_name_key: string;
	rating: number;
	peak_rating: number;
	tier: RankedTier;
	wins: number;
	games: number;
}

export interface I2v2Team {
	brawlhalla_id_one: number;
	brawlhalla_id_two: number;
	rating: number;
	peak_rating: number;
	tier: RankedTier;
	wins: number;
	games: number;
	teamname: string;
	region: number;
	global_rank: number;
}
//#endregion

//#region API Clan
export interface IClan {
	clan_id: number;
	clan_name: string;
	clan_create_date: number;
	clan_xp: string;
	clan: IClanMember[];
}

export interface IClanMember {
	brawlhalla_id: number;
	name: string;
	rank: ClanRank;
	join_date: number;
	xp: number;
}
//#endregion

//#region API Rankings
export interface IRanking {
	rank: number;
	rating: number;
	tier: RankedTier;
	games: number;
	wins: number;
	region: RankedRegion;
	peak_rating: number;
}

export interface IRanking1v1 extends IRanking {
	name: string;
	brawlhalla_id: number;
	best_legend: number;
	best_legend_games: number;
	best_legend_wins: number;
	twitch_name?: string;
}

export interface IRanking2v2 extends IRanking {
	teamname: string;
	brawlhalla_id_one: number;
	brawlhalla_id_two: number;
	twitch_name_one?: string;
	twitch_name_two?: string;
}
//#endregion
