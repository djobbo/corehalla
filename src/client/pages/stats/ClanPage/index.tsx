// Library imports
import React, { FC, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ClanRank, IClanFormat } from 'corehalla.js';

// Hooks
import { useFetchData } from '../../../hooks/useFetchData';
import { useMockData } from '../../../hooks/useMockData';
import { useHashTabs } from '../../../hooks/useHashTabs';

// Components imports
import { AppBar } from '../../../components/AppBar';
import { BottomNavigationBar } from '../../../components/BottomNavigationBar';
import { Loader } from '../../../components/Loader';
import { Page, PageContentWrapper } from '../../../components/Page';

// Tabs imports
import { OverviewTab } from './OverviewTab';
import { MembersTab } from './MembersTab';

type ClanStatsTab = '#overview' | '#members';

const sectionTransition = {
    in: {
        opacity: 1,
    },
    out: {
        opacity: 0,
    },
    init: {
        opacity: 0,
    },
};

export const ClanPage: FC = () => {
    // Fetch Clan ID
    const { id: clanId } = useParams<{ id: string }>();
    // Initialize Tabs
    const [activeTab] = useHashTabs<ClanStatsTab>(['#overview', '#members'], '#overview');

    const [activeRank, setActiveRank] = useState<ClanRank | 'all'>('all');

    // Fetch Clan Stats
    const [clanStats, loading] =
        process.env.NODE_ENV === 'production'
            ? useFetchData<IClanFormat>(`/api/stats/clan/${clanId}`)
            : useMockData<IClanFormat>('ClanStats', 0);

    const renderActiveTab = () => {
        switch (activeTab) {
            case '#members':
                return (
                    <MembersTab
                        members={
                            activeRank === 'all'
                                ? clanStats.members
                                : clanStats.members.filter((m) => m.rank === activeRank)
                        }
                        clanXP={parseInt(clanStats.xp)} // TODO: parse xp in ch.js
                    />
                );
            default:
                return <OverviewTab clanStats={clanStats} />;
        }
    };

    return (
        <Page>
            {!loading && (
                <Helmet>
                    <title>{clanStats.name} Stats • Corehalla</title>
                </Helmet>
            )}
            <AppBar
                title={loading ? 'loading' : clanStats.name || 'Corehalla'}
                tabs={[
                    { title: 'overview', link: `#`, active: activeTab === '#overview' },
                    { title: 'members', link: `#members`, active: activeTab === '#members' },
                ]}
                chips={
                    activeTab === '#members'
                        ? [
                              {
                                  title: 'All',
                                  action: () => setActiveRank('all'),
                                  active: activeRank === 'all',
                              },
                              {
                                  title: 'Leader',
                                  action: () => setActiveRank('Leader'),
                                  active: activeRank === 'Leader',
                              },
                              {
                                  title: 'Officers',
                                  action: () => setActiveRank('Officer'),
                                  active: activeRank === 'Officer',
                              },
                              {
                                  title: 'Members',
                                  action: () => setActiveRank('Member'),
                                  active: activeRank === 'Member',
                              },
                              {
                                  title: 'Recruits',
                                  action: () => setActiveRank('Recruit'),
                                  active: activeRank === 'Recruit',
                              },
                          ]
                        : undefined
                }
            />
            <PageContentWrapper pTop={activeTab === '#members' ? '9rem' : '6rem'} pBtm="3rem">
                <AnimatePresence exitBeforeEnter initial>
                    {loading ? (
                        <Loader key="loader" />
                    ) : (
                        <motion.div key="page" animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
                            <main>
                                <AnimatePresence exitBeforeEnter initial>
                                    <motion.div
                                        key={activeTab}
                                        animate="in"
                                        exit="out"
                                        initial="init"
                                        variants={sectionTransition}
                                        transition={{ default: { duration: 0.25, ease: 'easeInOut' } }}
                                    >
                                        {renderActiveTab()}
                                    </motion.div>
                                </AnimatePresence>
                            </main>
                        </motion.div>
                    )}
                </AnimatePresence>
            </PageContentWrapper>
            <BottomNavigationBar />
        </Page>
    );
};
