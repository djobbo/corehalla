import { IRanking1v1, RankedTier } from '../types';
import { format1v1Ranking, format1v1Rankings } from './rankings1v1';

const test1v1RankingsData = JSON.parse(`[
    {
        "rank": "1",
        "name": "Dobrein\u00f0\u009f\u0091\u00bb",
        "brawlhalla_id": 20877,
        "best_legend": 25,
        "best_legend_games": 719,
        "best_legend_wins": 642,
        "rating": 2872,
        "tier": "Diamond",
        "games": 719,
        "wins": 642,
        "region": "EU",
        "peak_rating": 2872
    },
    {
        "rank": "2",
        "name": "Maltimum\u00bb",
        "brawlhalla_id": 299070,
        "best_legend": 20,
        "best_legend_games": 245,
        "best_legend_wins": 123,
        "rating": 2697,
        "tier": "Diamond",
        "games": 774,
        "wins": 572,
        "region": "EU",
        "peak_rating": 2804
    }
]`) as IRanking1v1[];

test('Correct 1v1 Ranking Format', () => {
    const ranking1v1Format = format1v1Ranking(test1v1RankingsData[1]);
    expect(ranking1v1Format).toBeDefined();
    expect(ranking1v1Format.name).toBe('Maltimum\u00bb');
    expect(ranking1v1Format.id).toBe(299070);
    expect(ranking1v1Format.tier).toBe<RankedTier>('Diamond');
    expect(ranking1v1Format.games).toBe(774);
    expect(ranking1v1Format.wins).toBe(572);
    expect(ranking1v1Format.region).toBe('EU');
    expect(ranking1v1Format.rating).toBe(2697);
    expect(ranking1v1Format.peak).toBe(2804);
    expect(ranking1v1Format.twitchName).toBeUndefined();

    const bestLegend = ranking1v1Format.bestLegend;
    expect(bestLegend).toBeDefined();
    expect(bestLegend.id).toBe(20);
    expect(bestLegend.games).toBe(245);
    expect(bestLegend.wins).toBe(123);
});

test('Correct 1v1 Rankings Format', () => {
    const rankings1v1Format = format1v1Rankings(test1v1RankingsData);
    expect(rankings1v1Format).toBeDefined();
    expect(rankings1v1Format.length).toBe(2);
});
