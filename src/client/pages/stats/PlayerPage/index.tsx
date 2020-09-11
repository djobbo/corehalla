// Library imports
import React, { FC } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IPlayerStatsFormat } from 'corehalla.js';

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
import { TeamsTab } from './TeamsTab';
import { LegendsTab } from './LegendsTab';

type PlayerStatsTab = '#overview' | '#teams' | '#legends' | '#weapons';

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

export const PlayerStatsPage: FC = () => {
    // Fetch Player ID
    const { id: playerId } = useParams<{ id: string }>();
    // Initialize Tabs
    const [activeTab] = useHashTabs<PlayerStatsTab>(['#overview', '#teams', '#legends', '#weapons'], '#overview');
    // Fetch Player Stats
    const [playerStats, loading] =
        process.env.NODE_ENV === 'production'
            ? useFetchData<IPlayerStatsFormat>(`/api/stats/player/${playerId}`)
            : useMockData<IPlayerStatsFormat>('PlayerStats', 250);

    const renderActiveTab = () => {
        switch (activeTab) {
            case '#teams':
                return <TeamsTab {...playerStats.season} />;
            case '#legends':
                return <LegendsTab {...playerStats} />;
            default:
                return <OverviewTab playerStats={playerStats} />;
        }
    };

    return (
        <Page>
            {!loading && (
                <Helmet>
                    <title>{playerStats.name} Stats • Corehalla</title>
                </Helmet>
            )}
            <AppBar
                title={loading ? 'loading' : playerStats.name}
                tabs={[
                    { title: 'overview', link: `#`, active: activeTab === '#overview' },
                    { title: 'teams', link: `#teams`, active: activeTab === '#teams' },
                    { title: 'legends', link: `#legends`, active: activeTab === '#legends' },
                    { title: 'weapons', link: `#weapons`, active: activeTab === '#weapons' },
                ]}
                chips={
                    activeTab === '#legends' && [
                        { title: 'All', link: '', active: true },
                        { title: 'Hammer', link: '' },
                        { title: 'Sword', link: '' },
                        { title: 'Blasters', link: '' },
                    ]
                }
            />
            <PageContentWrapper pTop="6.5rem">
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
