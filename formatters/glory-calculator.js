const getGloryFromWins = wins =>
	wins <= 150
		? 20 * wins
		: Math.floor(10 * (45 * Math.pow(Math.log10(wins * 2), 2)) + 245);

const getGloryFromBestRating = rating =>
	Math.floor(
		(() => {
			if (rating < 1200) return 250;
			if (rating < 1286)
				return 10 * (25 + 0.872093023 * (86 - (1286 - rating)));
			if (rating < 1390)
				return 10 * (100 + 0.721153846 * (104 - (1390 - rating)));
			if (rating < 1680)
				return 10 * (187 + 0.389655172 * (290 - (1680 - rating)));
			if (rating < 2000)
				return 10 * (300 + 0.428125 * (320 - (2000 - rating)));
			if (rating < 2300)
				return 10 * (437 + 0.143333333 * (300 - (2300 - rating)));
			return 10 * (480 + 0.05 * (400 - (2700 - rating)));
		})()
	);

const getHeroRatingSquash = rating =>
	rating < 2000
		? Math.floor((elo + 375) / 1.5)
		: Math.floor(1583 + (elo - 2000) / 10);

const GetPersonalRatingSquash = rating =>
	rating >= 1400
		? Math.floor(1400 + (elo - 1400.0) / (3.0 - (3000 - elo) / 800.0))
		: rating;

module.exports = {
	getGloryFromWins,
	getGloryFromBestRating,
	getHeroRatingSquash,
	GetPersonalRatingSquash
};
