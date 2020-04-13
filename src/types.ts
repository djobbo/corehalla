export type RankedTier =
	| 'Diamond'
	| 'Platinum 5'
	| 'Platinum 4'
	| 'Platinum 3'
	| 'Platinum 2'
	| 'Platinum 1'
	| 'Gold 5'
	| 'Gold 4'
	| 'Gold 3'
	| 'Gold 2'
	| 'Gold 1'
	| 'Gold 0'
	| 'Silver 5'
	| 'Silver 4'
	| 'Silver 3'
	| 'Silver 2'
	| 'Silver 1'
	| 'Silver 0'
	| 'Bronze 5'
	| 'Bronze 4'
	| 'Bronze 3'
	| 'Bronze 2'
	| 'Bronze 1'
	| 'Bronze 0'
	| 'Tin 5'
	| 'Tin 4'
	| 'Tin 3'
	| 'Tin 2'
	| 'Tin 1'
	| 'Tin 0';

export type RankedRegion =
	| 'all'
	| 'ALL'
	| 'us-e'
	| 'US-E'
	| 'eu'
	| 'EU'
	| 'sea'
	| 'SEA'
	| 'brz'
	| 'BRZ'
	| 'aus'
	| 'AUS'
	| 'us-w'
	| 'US-W'
	| 'jpn'
	| 'JPN';

export interface IRankingsOptions {
	bracket?: '1v1' | '2v2';
	region?: RankedRegion;
	page?: string | number;
	name?: string;
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
	clan: IPlayerClan;
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

export interface IPlayerSeason {
	rating: number;
	peak_rating: number;
	tier: RankedTier;
	wins: number;
	games: number;
	region: RankedRegion;
}

export interface IPlayerRanked extends IPlayerSeason {
	name: string;
	brawlhalla_id: number;
	global_rank: number;
	region_rank: number;
	legends: ILegendRanked[];
	'2v2': I2v2Team[];
}

export type ClanRank = 'Leader' | 'Officer' | 'Member' | 'Recruit';

export interface IClanMember {
	brawlhalla_id: number;
	name: string;
	rank: ClanRank;
	join_date: number;
	xp: number;
}

export interface IClan {
	clan_id: number;
	clan_name: string;
	clan_create_date: number;
	clan_xp: string;
	clan: IClanMember[];
}

export interface IRanking {
	rank: string;
	name: string;
	brawlhalla_id: number;
	best_legend: number;
	best_legend_games: number;
	best_legend_wins: number;
	rating: number;
	tier: RankedTier;
	games: number;
	wins: number;
	region: RankedRegion;
	peak_rating: number;
}

export type Weapon =
	| 'Hammer'
	| 'Sword'
	| 'Blasters'
	| 'Rocket Lance'
	| 'Spear'
	| 'Katars'
	| 'Axe'
	| 'Bow'
	| 'Gauntlets'
	| 'Scythe'
	| 'Cannon'
	| 'Orb';

export interface IStaticLegendData {
	id: number;
	name: string;
	weapon_one: Weapon;
	weapon_two: Weapon;
}

export interface IPlayerSeasonFormat {
	rating: number;
	peak_rating: number;
	tier: RankedTier;
	wins: number;
	games: number;
	region: RankedRegion;
	rating_squash: number;
	total_wins: number;
	best_overall_rating: number;
	glory_best_rating: number;
	glory_wins: number;
}

export interface I2v2TeamFormat {
	teammate_id: number;
	teammate_name: string;
	region: RankedRegion;
	season: {
		rating: number;
		peak_rating: number;
		tier: RankedTier;
		wins: number;
		games: number;
		rating_squash: number;
	};
}

export interface IPlayerStatsFormat {
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
	season: IPlayerSeasonFormat;
	clan: IPlayerClan;
	legends: ILegendStatsFormat[];
	weapons: IWeaponStatsFormat[];
	teams: I2v2TeamFormat[];
}

export interface ILegendStatsFormat {
	id: number;
	name: string;
	weapon_one: Weapon;
	weapon_two: Weapon;
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
	damageweaponone: number;
	damageweapontwo: number;
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
	season: ILegendSeasonFormat;
}

export interface ILegendSeasonFormat {
	rating: number;
	peak_rating: number;
	tier: RankedTier;
	wins: number;
	games: number;
	rating_squash: number;
}

export interface ILegendWeaponFormat {
	name: Weapon;
	legends: ILegendStatsFormat[];
}

export interface IWeaponStatsFormat {
	name: Weapon | null;
	level: number;
	xp: number;
	matchtime: number;
	damagedealt: number;
	kos: number;
	timeheld: number;
	season: {
		rating_acc: number;
		peak_rating_acc: number;
		best_rating: number;
		peak_rating: number;
		games: number;
		wins: number;
	};
	legends: IWeaponLegendFormat[];
}

export interface IWeaponLegendFormat {
	id: number;
	name: string;
	damagedealt: string;
	kos: number;
	matchtime: number;
	games: number;
	wins: number;
	xp: number;
	level: number;
	damageweapon: number;
	koweapon: number;
	timeheldweapon: number;
	season: ILegendSeasonFormat;
}

export interface IClanFormat {
	clan_id: number;
	clan_name: string;
	clan_create_date: number;
	clan_xp: string;
	memberCount: number;
	members: {
		Leader: IClanMember[];
		Officer: IClanMember[];
		Member: IClanMember[];
		Recruit: IClanMember[];
	};
	xpInClan: number;
}
