import Head from 'next/head';
import { GetServerSideProps } from 'next';
import type { IPlayerStatsFormat } from 'corehalla';
import { OverviewTab } from '@layout/pages/stats/PlayerStats_OverviewTab';
import { MainLayout } from '@layout/MainLayout';
import { LegendsTab } from '@layout/pages/stats/PlayerStats_LegendsTab';
import { TeamsTab } from '@layout/pages/stats/PlayerStats_TeamsTab';
import { fetchPlayerFormat } from '@api';
import { MockPlayerStats } from '@api/mocks/PlayerStats';

interface Props {
	playerStats: IPlayerStatsFormat;
}

export default function PlayerStatsPage({ playerStats }: Props) {
	return (
		<>
			<Head>
				<title>{playerStats.name} Stats • Corehalla</title>
			</Head>
			<MainLayout
				title={`${playerStats.name}'s Stats` ?? 'Corehalla'}
				tabs={{
					overview: {
						displayName: 'Overview',
						link: `/stats/player/${playerStats.id}`,
						component: OverviewTab(playerStats),
					},
					teams: {
						displayName: 'Teams',
						link: `/stats/player/${playerStats.id}?tab=teams`,
						component: TeamsTab(playerStats),
					},
					legends: {
						displayName: 'Legends',
						chips: {
							all: 'All',
							Hammer: null,
							Sword: null,
							Blasters: null,
							'Rocket Lance': null,
							Spear: null,
							Katars: null,
							Axe: null,
							Bow: null,
							Gauntlets: null,
							Scythe: null,
							Cannon: null,
							Orb: null,
							Greatsword: null,
						},
						defaultChip: 'all',
						link: `/stats/player/${playerStats.id}?tab=legends`,
						component: LegendsTab(playerStats),
					},
					// TODO: Add Weapons Tab
					// weapons: {
					// 	displayName: 'Weapons',
					// 	link: `/stats/player/${playerStats.id}?tab=weapons`,
					// 	component: OverviewTab(playerStats),
					// },
				}}
			/>
		</>
	);
}

export const getServerSideProps: GetServerSideProps<
	Props,
	{ id: string }
> = async ({ params: { id } }) => {
	let playerStats: IPlayerStatsFormat;

	if (process.env.NODE_ENV === 'production') {
		playerStats = await fetchPlayerFormat(
			process.env.BH_API_KEY,
			parseInt(id)
		);
	} else {
		playerStats = MockPlayerStats;
	}

	if (!playerStats) return { notFound: true };

	return {
		props: {
			playerStats,
		},
	};
};
