import React, { useState, useEffect, FC } from 'react';
import { Link, useParams, useRouteMatch } from 'react-router-dom';

import { IPlayerStatsFormat } from 'corehalla.js';

import { AppBar } from '../../../components/AppBar';
import { Loader } from '../../../components/Loader';
import { AnimatePresence, motion } from 'framer-motion';

import { OverviewTab } from './OverviewTab';
type PlayerStatsTab = 'overview' | 'teams' | 'legends' | 'weapons';

const sectionTrantision = {
    in: {
        opacity: 1,
        y: 0,
    },
    out: {
        opacity: 0,
    },
    init: {
        opacity: 0,
        y: '50vh',
    },
};

export const PlayerStatsPage: FC = () => {
    const { id: playerId, tab: activeTab } = useParams<{ id: string; tab: PlayerStatsTab }>();
    console.log(playerId, activeTab);
    console.log(useRouteMatch());

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
            }, 0);

            return () => clearTimeout(timeout);
        }
    }, []);

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'teams':
                return <>teams</>;
            default:
                return <OverviewTab playerStats={playerStats} />;
        }
    };

    // const currentPage = `/stats/player/${playerId}`;

    return (
        <>
            <AppBar
                title={loading ? 'loading' : playerStats.name || 'Corehalla'}
                tabs={[
                    { title: 'overview', link: `#`, active: true },
                    { title: 'teams', link: `#` },
                    { title: 'legends', link: `#` },
                    { title: 'weapons', link: `#` },
                ]}
                chips={[
                    { title: 'Global', link: `#`, active: true },
                    { title: 'US-E', link: `#` },
                    { title: 'EU', link: `#` },
                ]}
            />
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
                                    variants={sectionTrantision}
                                    transition={{ default: { duration: 0.25, ease: 'easeInOut' } }}
                                >
                                    {renderActiveTab()}
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
