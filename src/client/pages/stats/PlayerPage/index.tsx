// Library imports
import React, { useState, useEffect, FC } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IPlayerStatsFormat } from 'corehalla.js';

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
    const { id: playerId } = useParams<{ id: string }>();
    const { hash } = useLocation<{ hash: PlayerStatsTab }>();
    const activeTab: PlayerStatsTab = ['#teams', '#legends', '#weapons'].includes(hash)
        ? (hash as PlayerStatsTab)
        : '#overview';

    const [loading, setLoading] = useState(true);
    const [, setError] = useState(false);
    const [playerStats, setPlayerStats] = useState<IPlayerStatsFormat>();

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            const abortController = new AbortController();
            const signal = abortController.signal;

            fetch(`/api/stats/player/${playerId}`, { signal })
                .then(async (res) => {
                    const data = (await res.json()) as IPlayerStatsFormat;
                    setPlayerStats(data);
                    setLoading(false);
                })
                .catch(() => {
                    setError(true);
                });

            return () => abortController.abort();
        } else {
            const timeout = setTimeout(async () => {
                const { PlayerStats } = await import('../../../mockups/Player');
                setPlayerStats(PlayerStats);
                setLoading(false);
            }, 250);

            return () => clearTimeout(timeout);
        }
    }, []);

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
            <AppBar
                title={loading ? 'loading' : playerStats.name || 'Corehalla'}
                tabs={[
                    { title: 'overview', link: `#`, active: activeTab === '#overview' },
                    { title: 'teams', link: `#teams`, active: activeTab === '#teams' },
                    { title: 'legends', link: `#legends`, active: activeTab === '#legends' },
                    { title: 'weapons', link: `#weapons`, active: activeTab === '#weapons' },
                ]}
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
