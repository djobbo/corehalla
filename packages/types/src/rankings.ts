import type { RankedRegion, RankedTier } from './general';

export interface IRankingFormat {
    rank: number;
    rating: number;
    tier: RankedTier;
    games: number;
    wins: number;
    region: RankedRegion;
    peak: number;
}

export interface IRanking1v1Format extends IRankingFormat {
    name: string;
    id: number;
    bestLegend: {
        id: number;
        games: number;
        wins: number;
    };
    twitchName?: string;
}

export interface IRanking2v2Format extends IRankingFormat {
    players: {
        id: number;
        name: string;
        twitchName?: string;
    }[];
}
