import { map, arr, str, num } from 'mokapjs';

const UserNameGen = str(
	/([A-Z]{2,3} \| ){0,1}[A-Z][a-z][aeiou]([bcdfghjklmnpqrstvwxys]{0,1}[aeiou]{0,2}){2,5}([0-9]{0,4})/
);

const LegendNameGen = str([
	'Bödvar',
	'Cassidy',
	'Orion',
	'Lord Vraxx',
	'Gnash',
	'Queen Nai',
	'Hattori',
	'Sir Roland',
	'Scarlet',
	'Thatch',
	'Ada',
	'Sentinel',
	'Lucien',
	'Teros',
	'Brynn',
	'Asuri',
	'Barraza',
	'Ember',
	'Azoth',
	'Koji',
	'Ulgrim',
	'Diana',
	'Jhala',
	'Kor',
	'Wu Shang',
	'Val',
	'Ragnir',
	'Cross',
	'Mirage',
	'Nix',
	'Mordex',
	'Yumiko',
	'Artemis',
	'Caspian',
	'Sidra',
	'Xull',
	'Kaya',
	'Isaiah',
	'Jiro',
	'Lin Fei',
	'Zariel',
	'Rayman',
	'Dusk',
	'Fait',
	'Thor',
	'Petra',
	'Vector',
	'Volkov'
]);

const WeaponNameGen = str([
	'Hammer',
	'Sword',
	'Blasters',
	'Rocket Lance',
	'Spear',
	'Katars',
	'Axe',
	'Bow',
	'Gauntlets',
	'Scythe',
	'Cannon',
	'Orb'
]);

const ClanNameGen = str(
	/[A-Z][a-z][aeiou]([bcdfghjklmnpqrstvwxys]{0,1}[aeiou]{0,2}){3,6}/
);

const SeasonStatsGen = map({
	rating: num({ min: 750, max: 2800 }),
	peak_rating: num({ min: 750, max: 2800 }),
	tier: str([
		'Tin 4',
		'Bronze 5',
		'Gold 2',
		'Platinum 1',
		'Platinum 5',
		'Diamond'
	]),
	games: num({ min: 200, max: 300 }),
	wins: num({ min: 80, max: 200 })
});

const LegendGen = map({
	id: num({ min: 1, max: 50 }),
	name: LegendNameGen,
	matchtime: num({ min: 0, max: 9999999 }),
	games: num({ min: 2000, max: 3000 }),
	wins: num({ min: 1000, max: 2000 }),
	xp: num({ min: 0, max: 999999 }),
	level: num({ min: 1, max: 101 }),
	weapon_one: WeaponNameGen,
	weapon_two: WeaponNameGen,
	season: SeasonStatsGen
});

const WeaponGen = map({
	id: num({ min: 1, max: 50 }),
	name: WeaponNameGen,
	matchtime: num({ min: 0, max: 9999999 }),
	games: num({ min: 2000, max: 3000 }),
	wins: num({ min: 1000, max: 2000 }),
	xp: num({ min: 0, max: 999999 }),
	level: num({ min: 1, max: 101 }),
	season: SeasonStatsGen
});

const ClanGen = map({
	clan_name: ClanNameGen,
	id: num({ min: 1, max: 99999 }),
	xp: num({ min: 9999, max: 9999999 }),
	personal_xp: num({ min: 0, max: 9999 })
});

const TeamStatsGen = map({
	teammate_id: num({ min: 1, max: 999999 }),
	teammate_name: UserNameGen,
	region: str(['us-e', 'eu', 'brz', 'aus', 'us-w', 'sea', 'jpn']),
	season: SeasonStatsGen
});

const PlayerStatsGen = map({
	id: num({ min: 1, max: 999999 }),
	name: UserNameGen,
	xp: num({ min: 0, max: 9999999 }),
	level: num({ min: 1, max: 101 }),
	games: num({ min: 10000, max: 15000 }),
	wins: num({ min: 5000, max: 10000 }),
	season: SeasonStatsGen,
	region: str(['us-e', 'eu', 'brz', 'aus', 'us-w', 'sea', 'jpn']),
	legends: arr(LegendGen, 40),
	weapons: arr(WeaponGen, 12),
	teams: arr(TeamStatsGen, { min: 3, max: 12 }),
	clan: ClanGen
});

export default PlayerStatsGen;
