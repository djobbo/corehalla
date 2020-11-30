export interface IPowerRankingsFormat {
	rank: number;
	socials: {
		twitter?: string;
		twitch?: string;
	};
	name: string;
	earnings: number;
	t8: number;
	t32: number;
	medals: {
		gold: number;
		silver: number;
		bronze: number;
	};
}
