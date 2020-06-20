import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import './styles.scss';

import { Header, Page } from './Header';
import { SectionOverview } from './SectionOverview';
import { SectionOverallStats } from './SectionOverallStats';
import { SectionRanked2v2 } from './SectionRanked2v2';
import { SectionLegends } from './SectionLegends';
import { SectionWeapons } from './SectionWeapons';
import { SectionClan } from './SectionClan';

import { IPlayerStatsFormat } from 'corehalla.js';

import { Loader } from '../../../components/Loader';
import { AnimatePresence, motion } from 'framer-motion';

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

export const PlayerStatsPage: React.FC = () => {
    const { params } = useRouteMatch<{
        id: string;
    }>('/stats/player/:id');

    const sections = ['teams', 'legends', 'weapons'];
    const hash = window.location.hash.substring(1);

    const [activePage, setActivePage] = useState<Page>(sections.includes(hash) ? (hash as Page) : 'overview');

    const [loading, setLoading] = useState(true);
    const [, setError] = useState(false);
    const [playerStats, setPlayerStats] = useState<IPlayerStatsFormat>();

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            const abortController = new AbortController();
            const signal = abortController.signal;

            fetch(`/api/stats/player/${params.id}`, { signal })
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
            }, 1500);

            return () => clearTimeout(timeout);
        }
    }, []);

    const section = (() => {
        if (loading) return '';
        console.log(activePage);
        switch (activePage) {
            case 'teams':
                return (
                    <motion.div
                        key="teams"
                        animate="in"
                        exit="out"
                        initial="init"
                        variants={sectionTrantision}
                        transition={{ default: { duration: 0.25, ease: 'easeInOut' } }}
                    >
                        <SectionRanked2v2 teams={playerStats.season.teams} />
                    </motion.div>
                );
            case 'legends':
                return (
                    <motion.div
                        key="legends"
                        animate="in"
                        exit="out"
                        initial="init"
                        variants={sectionTrantision}
                        transition={{ default: { duration: 0.25, ease: 'easeInOut' } }}
                    >
                        <SectionLegends legends={playerStats.legends} weapons={playerStats.weapons} key="legends" />
                    </motion.div>
                );
            case 'weapons':
                return (
                    <motion.div
                        key="weapons"
                        animate="in"
                        exit="out"
                        initial="init"
                        variants={sectionTrantision}
                        transition={{ default: { duration: 0.25, ease: 'easeInOut' } }}
                    >
                        <SectionWeapons weapons={playerStats.weapons} key="weapons" />
                    </motion.div>
                );
            default:
                return (
                    <motion.div
                        key="overview"
                        animate="in"
                        exit="out"
                        initial="init"
                        variants={sectionTrantision}
                        transition={{ default: { duration: 0.25, ease: 'easeInOut' } }}
                    >
                        <SectionOverview
                            season={playerStats.season}
                            bestLegend={playerStats.legends.sort((a, b) => b.season.rating - a.season.rating)[0]}
                        />
                        {playerStats.clan ? <SectionClan clan={playerStats.clan} /> : ''}
                        <SectionOverallStats playerStats={playerStats} />
                    </motion.div>
                );
        }
    })();

    return (
        <AnimatePresence exitBeforeEnter initial>
            {loading ? (
                <Loader key="loader" />
            ) : (
                <motion.div className="PlayerPage" key="page" animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
                    <Header activePage={activePage} setActivePage={setActivePage} playerStats={playerStats} />
                    <main>
                        <AnimatePresence exitBeforeEnter initial>
                            {section}
                        </AnimatePresence>
                    </main>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
