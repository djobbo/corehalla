import React, { useState, useEffect, FC } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { IPlayerStatsFormat } from 'corehalla.js';

import { AppBar } from '../../../components/AppBar';
import { Loader } from '../../../components/Loader';
import { Page, PageContentWrapper } from '../../../components/Page';
import { AnimatePresence, motion } from 'framer-motion';

import { OverviewTab } from './OverviewTab';
import { LegendsTab } from './MembersTab';
import { BottomNavigationBar } from '../../../components/BottomNavigationBar';

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

export const ClanStatsPage: FC = () => {
    const { id: clanId } = useParams<{ id: string }>();
    const { hash } = useLocation<{ hash: ClanStatsTab }>();
    const activeTab: ClanStatsTab = ['#members'].includes(hash) ? (hash as PlayerStatsTab) : '#overview';

    const [loading, setLoading] = useState(true);
    const [, setError] = useState(false);
    const [playerStats, setPlayerStats] = useState<IPlayerStatsFormat>();

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            const abortController = new AbortController();
            const signal = abortController.signal;

            fetch(`/api/stats/clan/${clanId}`, { signal })
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
            }, 0);

            return () => clearTimeout(timeout);
        }
    }, []);

    const renderActiveTab = () => {
        switch (activeTab) {
            case '#members':
                return <MembersTab> {...clanStats} />;
            default:
                return <OverviewTab clanStats={clanStats} />;
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
                        <motion.div className="PlayerPage" key="page" animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
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
