import {
    getGloryFromBestRating,
    getGloryFromWins,
    getHeroRatingSquash,
    getPersonalRatingSquash,
    getTierFromRating,
} from './gloryCalculator';

describe('Correct glory calculation', () => {
    const testGloryFromBestRating = [
        [0, 250],
        [750, 250],
        [1000, 250],
        [1426, 2010],
        [1613, 2738],
        [1978, 4275],
    ];
    test('Correct glory from best rating', () => {
        testGloryFromBestRating.forEach(([rating, glory]) => {
            expect(getGloryFromBestRating(rating)).toBe(glory);
        });
    });

    const testGloryFromWins = [
        [0, 0],
        [10, 200],
        [54, 1080],
        [512, 4322],
        [618, 4547],
        [1253, 5443],
    ];
    test('Correct glory from wins', () => {
        testGloryFromWins.forEach(([rating, glory]) => {
            expect(getGloryFromWins(rating)).toBe(glory);
        });
    });
});

describe('Correct rating squash calculation', () => {
    const testHeroRatingSquash = [
        [0, 250],
        [750, 750],
        [1000, 916],
        [1216, 1060],
        [1536, 1274],
        [1897, 1514],
        [2000, 1583],
        [2433, 1626],
        [3000, 1683],
    ];
    test('Correct hero rating squash', () => {
        testHeroRatingSquash.forEach(([rating, squash]) => {
            expect(getHeroRatingSquash(rating)).toBe(squash);
        });
    });

    const testPersonalRatingSquash = [
        [0, 0],
        [750, 750],
        [1000, 1000],
        [1216, 1216],
        [1536, 1516],
        [1897, 1706],
        [2000, 1742],
        [2433, 1850],
        [3000, 1933],
    ];
    test('Correct personal rating squash', () => {
        testPersonalRatingSquash.forEach(([rating, squash]) => {
            expect(getPersonalRatingSquash(rating)).toBe(squash);
        });
    });
});
