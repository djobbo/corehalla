//TODO: this file is a duplicate, og file in api

export const rankedTiers: [string, number][] = [
	['Diamond', 2000],
	['Platinum 5', 1936],
	['Platinum 4', 1872],
	['Platinum 3', 1808],
	['Platinum 2', 1744],
	['Platinum 1', 1680],
	['Gold 5', 1622],
	['Gold 4', 1564],
	['Gold 3', 1506],
	['Gold 2', 1448],
	['Gold 1', 1390],
	['Gold 0', 1338],
	['Silver 5', 1338],
	['Silver 4', 1286],
	['Silver 3', 1234],
	['Silver 2', 1182],
	['Silver 1', 1130],
	['Silver 0', 1086],
	['Bronze 5', 1086],
	['Bronze 4', 1042],
	['Bronze 3', 998],
	['Bronze 2', 954],
	['Bronze 1', 910],
	['Bronze 0', 872],
	['Tin 5', 872],
	['Tin 4', 834],
	['Tin 3', 796],
	['Tin 2', 758],
	['Tin 1', 720],
	['Tin 0', 200],
];

export const getGloryFromWins = (wins: number) =>
	wins <= 150
		? 20 * wins
		: Math.floor(10 * (45 * Math.pow(Math.log10(wins * 2), 2)) + 245);

export const getGloryFromBestRating = (rating: number) =>
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

export const getHeroRatingSquash = (rating: number) =>
	rating < 2000
		? Math.floor((rating + 375) / 1.5)
		: Math.floor(1583 + (rating - 2000) / 10);

export const getPersonalRatingSquash = (rating: number) =>
	rating >= 1400
		? Math.floor(1400 + (rating - 1400.0) / (3.0 - (3000 - rating) / 800.0))
		: rating;

export const getTierFromRating = (rating: number) =>
	rankedTiers.find((r) => rating >= r[1]) ||
	rankedTiers[rankedTiers.length - 1];
