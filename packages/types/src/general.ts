export type BrawlhallaID = string | number;

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
    | 'Tin 0'
    | 'Unranked';

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
    | 'Orb'
    | 'Greatsword';

export type ClanRank = 'Leader' | 'Officer' | 'Member' | 'Recruit';

export interface IStaticLegendData {
    id: number;
    name: string;
    weapon_one: Weapon;
    weapon_two: Weapon;
}
