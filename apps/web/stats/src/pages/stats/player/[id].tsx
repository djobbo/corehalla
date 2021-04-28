import Head from 'next/head';
import { GetServerSideProps } from 'next';
import type { IPlayerStatsFormat, Weapon } from '@corehalla/types';
import { OverviewTab } from '~layout/pages/stats/PlayerStats_OverviewTab';
import { TabLayout } from '~layout/TabLayout';
import { LegendSort, LegendsTab } from '~layout/pages/stats/PlayerStats_LegendsTab';
import { TeamsSort, TeamsTab } from '~layout/pages/stats/PlayerStats_TeamsTab';
import { fetchPlayerFormat } from '@corehalla/core';
import { MockPlayerStats } from '@corehalla/mocks';

interface Props {
    playerStats: IPlayerStatsFormat;
}

type PlayerStatsTabs = 'overview' | 'teams' | 'legends';

export default function PlayerStatsPage({ playerStats }: Props): JSX.Element {
    return (
        <>
            <Head>
                <title>{playerStats.name} Stats • Corehalla</title>
            </Head>
            <TabLayout<
                PlayerStatsTabs,
                {
                    overview: [null, null];
                    teams: [null, TeamsSort];
                    legends: [Weapon | 'all', LegendSort];
                }
            >
                title={`${playerStats.name}'s Stats` ?? 'Corehalla'}
                tabs={{
                    overview: {
                        displayName: 'Overview',
                        link: `/stats/player/${playerStats.id}`,
                        component: OverviewTab(playerStats),
                        chips: null,
                        defaultChip: null,
                        sortOptions: null,
                        defaultSort: null,
                    },
                    teams: {
                        displayName: 'Teams',
                        link: `/stats/player/${playerStats.id}?tab=teams`,
                        component: TeamsTab(playerStats),
                        chips: null,
                        defaultChip: null,
                        sortOptions: {
                            rating: 'Rating',
                            peak: 'Peak Rating',
                            games: 'Games',
                            wins: 'Wins',
                            losses: 'Losses',
                            winrate: 'Winrate',
                        },
                        defaultSort: 'rating',
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
                        sortOptions: {
                            level: 'Level',
                            matchtime: 'Time Played',
                            rating: 'Rating',
                            peak: 'Peak Rating',
                            games: 'Games',
                            winrate: 'Winrate',
                            'ranked games': 'Ranked Games',
                            'ranked winrate': 'Ranked Winrate',
                        },
                        defaultSort: 'level',
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

export const getServerSideProps: GetServerSideProps<Props, { id: string }> = async ({ params: { id } }) => {
    let playerStats: IPlayerStatsFormat;

    if (process.env.NODE_ENV === 'production') {
        playerStats = await fetchPlayerFormat(process.env.BH_API_KEY, parseInt(id));
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
