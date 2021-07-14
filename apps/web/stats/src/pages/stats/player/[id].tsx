import Head from 'next/head';
import { GetServerSideProps } from 'next';
import type { IPlayerStatsFormat } from '@corehalla/types';
import { OverviewTab } from '~layout/pages/stats/PlayerStats_OverviewTab';
import { LegendsTab } from '~layout/pages/stats/PlayerStats_LegendsTab';
import { fetchPlayerFormat } from '@corehalla/core';
import { MockPlayerStats } from '@corehalla/mocks';
import { TabsProvider, useTabs } from '~providers/TabsProvider';
import { Header } from '~components/Header';
import { Tabs } from '~components/Tabs';

interface Props {
    playerStats: IPlayerStatsFormat;
}

type PlayerStatsTabs = 'overview' | 'teams' | 'legends';

const Tab = ({ playerStats }: Props) => {
    const { tab } = useTabs<PlayerStatsTabs>();

    switch (tab) {
        case 'overview':
            return <OverviewTab playerStats={playerStats} />;
        case 'teams':
            return <>Teams</>;
        case 'legends':
            return <LegendsTab playerStats={playerStats} />;
        default:
            return <OverviewTab playerStats={playerStats} />;
    }
};

const PlayerStatsPage = ({ playerStats }: Props): JSX.Element => {
    return (
        <TabsProvider<PlayerStatsTabs> defaultTab="overview">
            <Head>
                <title>{playerStats.name} Stats • Corehalla</title>
            </Head>
            <Header />
            <Tabs<PlayerStatsTabs>
                tabs={[
                    { title: 'Overview', name: 'overview' },
                    { title: 'Teams', name: 'teams' },
                    { title: 'Legends', name: 'legends' },
                ]}
            />
            <Tab playerStats={playerStats} />
        </TabsProvider>
    );
};

export default PlayerStatsPage;

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
