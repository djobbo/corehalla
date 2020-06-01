import { arr, str, map, num } from 'mokapjs';

const PlayerGen = map({
    rank: num({ min: 1, max: 50 }),
    name: str(/[A-Z][a-z]{2,16}/),
    id: num({ min: 1, max: 999999 }),
    tier: str(['Tin 4', 'Bronze 5', 'Gold 2', 'Platinum 1', 'Platinum 5', 'Diamond']),
    games: num({ min: 200, max: 300 }),
    wins: num({ min: 80, max: 200 }),
    region: str(['US-E', 'EU', 'BRZ', 'AUS', 'US-W', 'SEA', 'JPN']),
    rating: num({ min: 750, max: 2800 }),
    peak_rating: num({ min: 750, max: 2800 }),
});

const RankingsGen = arr(PlayerGen, 50);

export default RankingsGen;
