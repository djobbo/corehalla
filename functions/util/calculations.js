module.exports = {
	winrate: (wins, games, digits) => {
		const precision = Math.pow(10, digits);
		return Math.round((wins / games) * precision * 100) / precision;
	},
	dps: (damage, time, digits) => {
		const precision = Math.pow(10, digits);
		return time === 0
			? 'N/A'
			: Math.round((damage / time) * precision) / precision;
	},
	ttk: (kos, time, digits) => {
		const precision = Math.pow(10, digits);
		return time === 0 ? undefined : Math.round(kos / time) / precision;
	},
	suicide_rate: (suicides, games, digits) => {
		const precision = Math.pow(10, digits);
		return suicides === 0
			? 'N/A'
			: Math.round((games / suicides) * precision) / precision;
	},
	avg_game_length: (games, time) => {
		return games === 0 ? 'N/A' : time / games;
	},
	avg_kos_per_game: (kos, games, digits) => {
		const precision = Math.pow(10, digits);
		return games === 0
			? 'N/A'
			: Math.round((kos / games) * precision) / precision;
	}
};
