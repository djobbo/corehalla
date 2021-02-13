import Head from 'next/head';
import type { IPlayerStatsFormat, Weapon } from 'corehalla';

import { MainLayout } from '@layout';

import { GetServerSideProps } from 'next';
import { fetchPlayerFormat } from '@api';
import { MockPlayerStats } from '@api/mocks/PlayerStats';
import { PropsWithChildren } from 'react';

export type PlayerStatsTab = 'overview' | 'teams' | 'legends' | 'weapons';

export interface IPlayerStatsTabs {
	overview: null;
	teams: null;
	legends: Weapon | 'all';
	weapons: null;
}

export interface PlayerStatsProps<T extends PlayerStatsTab> {
	playerStats: IPlayerStatsFormat;
	onActiveChipChanged?: (chip: IPlayerStatsTabs[T]) => void;
}

export function PlayerStatsLayout<XD extends PlayerStatsTab>({
	playerStats,
	children,
	onActiveChipChanged,
}: PropsWithChildren<PlayerStatsProps<XD>>) {
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
						chips: {},
					},
					teams: {
						displayName: 'Teams',
						link: `/stats/player/${playerStats.id}/teams`,
						chips: {},
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
						link: `/stats/player/${playerStats.id}/legends`,
					},
					weapons: {
						displayName: 'Weapons',
						link: `/stats/player/${playerStats.id}/weapons`,
						chips: {},
					},
				}}
				// onActiveChipChanged={(e) => {}}
				onActiveChipChanged={onActiveChipChanged}
			>
				{children}
			</MainLayout>
		</>
	);
}

export const getPlayerStatsProps: GetServerSideProps<
	PlayerStatsProps<PlayerStatsTab>,
	{ playerID }
> = async ({ params: { playerID } }) => {
	let playerStats: IPlayerStatsFormat;

	if (process.env.NODE_ENV === 'production') {
		playerStats = await fetchPlayerFormat(
			process.env.BH_API_KEY,
			parseInt(playerID)
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
