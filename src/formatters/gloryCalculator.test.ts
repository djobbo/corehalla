import {
    getGloryFromBestRating,
    getGloryFromWins,
    getHeroRatingSquash,
    getPersonalRatingSquash,
    getTierFromRating,
} from './gloryCalculator';

const testGloryFromBestRating = [
    [0, 250],
    [750, 250],
    [1000, 250],
    [1426, 2010],
    [1613, 2738],
    [1978, 4275],
];

test('Correct Glory from Best Rating', () => {
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

test('Correct Glory from Best Wins', () => {
    testGloryFromWins.forEach(([rating, glory]) => {
        expect(getGloryFromWins(rating)).toBe(glory);
    });
});
