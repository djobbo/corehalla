// Library imports
import React, { FC } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { ClanRank, IClanFormat } from 'corehalla.js';
import loadable from '@loadable/component';

// Hooks
import { useFetchData } from '../../../hooks/useFetchData';
import { useMockData } from '../../../hooks/useMockData';

// Layout imports
import { MainLayout } from '../../../layout';

// Tabs imports
const OverviewTab = loadable(() => import('./OverviewTab'), {
    resolveComponent: (mod) => mod.OverviewTab,
});
const MembersTab = loadable(() => import('./MembersTab'), {
    resolveComponent: (mod) => mod.MembersTab,
});

type ClanStatsTab = 'overview' | 'members';

export const ClanPage: FC = () => {
    // Fetch Clan ID
    const { id: clanId } = useParams<{ id: string }>();

    // Fetch Clan Stats
    const [clanStats, loading] =
        process.env.NODE_ENV === 'production'
            ? useFetchData<IClanFormat>(`/api/stats/clan/${clanId}`)
            : useMockData<IClanFormat>('ClanStats', 0);

    const renderOverviewTab = () => <OverviewTab clanStats={clanStats} />;

    const renderMembersTab = (activeRank: ClanRank | 'all') => (
        <MembersTab
            members={activeRank === 'all' ? clanStats.members : clanStats.members.filter((m) => m.rank === activeRank)}
            clanXP={parseInt(clanStats.xp)} // TODO: parse xp in ch.js
        />
    );

    return (
        <>
            {!loading && (
                <Helmet>
                    <title>{clanStats.name} Stats • Corehalla</title>
                </Helmet>
            )}
            <MainLayout<ClanStatsTab, ClanRank | 'all'>
                title={loading ? 'loading' : clanStats.name || 'Corehalla'}
                tabs={{
                    overview: {
                        render: renderOverviewTab,
                        displayName: 'Overview',
                    },
                    members: {
                        render: renderMembersTab,
                        displayName: 'Members',
                        chips: [
                            { chipName: 'all', displayName: 'All' },
                            { chipName: 'Leader', displayName: 'Leader' },
                            { chipName: 'Officer', displayName: 'Officers' },
                            { chipName: 'Member', displayName: 'Members' },
                            { chipName: 'Recruit', displayName: 'Recruits' },
                        ],
                        defaultChip: 'all',
                    },
                }}
                defaultTab="overview"
                loading={loading}
            ></MainLayout>
        </>
    );
};
