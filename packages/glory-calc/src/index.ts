import { rankedTiers } from '@corehalla/static';
import { RankedTier } from '@corehalla/types';

export const getGloryFromWins = (wins: number): number =>
    wins <= 150 ? 20 * wins : Math.floor(10 * (45 * Math.pow(Math.log10(wins * 2), 2)) + 245);

export const getGloryFromBestRating = (rating: number): number =>
    Math.floor(
        (() => {
            if (rating < 1200) return 250;
            if (rating < 1286) return 10 * (25 + 0.872093023 * (86 - (1286 - rating)));
            if (rating < 1390) return 10 * (100 + 0.721153846 * (104 - (1390 - rating)));
            if (rating < 1680) return 10 * (187 + 0.389655172 * (290 - (1680 - rating)));
            if (rating < 2000) return 10 * (300 + 0.428125 * (320 - (2000 - rating)));
            if (rating < 2300) return 10 * (437 + 0.143333333 * (300 - (2300 - rating)));
            return 10 * (480 + 0.05 * (400 - (2700 - rating)));
        })(),
    );

export const getHeroRatingSquash = (rating: number): number =>
    rating < 2000 ? Math.floor((rating + 375) / 1.5) : Math.floor(1583 + (rating - 2000) / 10);

export const getPersonalRatingSquash = (rating: number): number =>
    rating >= 1400 ? Math.floor(1400 + (rating - 1400.0) / (3.0 - (3000 - rating) / 800.0)) : rating;

export const getTierFromRating = (rating: number): [RankedTier, number] =>
    rankedTiers.find((r) => rating >= r[1]) || rankedTiers[rankedTiers.length - 1];
