const {
	getGloryFromWins,
	getGloryFromBestRating,
	getHeroRatingSquash,
	getPersonalRatingSquash
} = require('./gloryCalculator');

test('Glory From Wins', () => {
	expect(getGloryFromWins(0)).toBe(0);
	expect(getGloryFromWins(125)).toBe(2500);
	expect(getGloryFromWins(2)).toBe(40);
	expect(getGloryFromWins(500)).toBe(4295);
	expect(getGloryFromWins(5426)).toBe(7573);
});

test('Glory From Best Rating', () => {
	expect(getGloryFromBestRating(0)).toBe(250);
	expect(getGloryFromBestRating(200)).toBe(250);
	expect(getGloryFromBestRating(1132)).toBe(250);
	expect(getGloryFromBestRating(1251)).toBe(694);
	expect(getGloryFromBestRating(1300)).toBe(1100);
	expect(getGloryFromBestRating(1516)).toBe(2360);
	expect(getGloryFromBestRating(1742)).toBe(3265);
	expect(getGloryFromBestRating(2000)).toBe(4370);
	expect(getGloryFromBestRating(2578)).toBe(4939);
});

test('Hero Rating Squash', () => {
	expect(getHeroRatingSquash(0)).toBe(250);
	expect(getHeroRatingSquash(427)).toBe(534);
	expect(getHeroRatingSquash(1000)).toBe(916);
	expect(getHeroRatingSquash(1500)).toBe(1250);
	expect(getHeroRatingSquash(2000)).toBe(1583);
	expect(getHeroRatingSquash(3253)).toBe(1708);
});

test('Personal Rating Squash', () => {
	expect(getPersonalRatingSquash(0)).toBe(0);
	expect(getPersonalRatingSquash(427)).toBe(427);
	expect(getPersonalRatingSquash(1000)).toBe(1000);
	expect(getPersonalRatingSquash(1500)).toBe(1488);
	expect(getPersonalRatingSquash(2000)).toBe(1742);
	expect(getPersonalRatingSquash(3253)).toBe(1958);
});
