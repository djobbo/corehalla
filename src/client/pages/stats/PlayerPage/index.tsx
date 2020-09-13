// Library imports
import React, { FC, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IPlayerStatsFormat, Weapon } from 'corehalla.js';

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

    const [activeWeapon, setActiveWeapon] = useState<Weapon | 'all'>('all');

    const renderActiveTab = () => {
        switch (activeTab) {
            case '#teams':
                return <TeamsTab {...playerStats.season} />;
            case '#legends':
                return (
                    <LegendsTab
                        legends={
                            activeWeapon === 'all'
                                ? playerStats.legends
                                : playerStats.legends.filter((l) =>
                                      [l.weapons.weaponOne.name, l.weapons.weaponTwo.name].includes(activeWeapon),
                                  )
                        }
                    />
                );
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
                        {
                            title: 'All',
                            action: () => setActiveWeapon('all'),
                            active: activeWeapon === 'all',
                        },
                        {
                            title: 'Hammer',
                            action: () => setActiveWeapon('Hammer'),
                            active: activeWeapon === 'Hammer',
                        },
                        {
                            title: 'Sword',
                            action: () => setActiveWeapon('Sword'),
                            active: activeWeapon === 'Sword',
                        },
                        {
                            title: 'Blasters',
                            action: () => setActiveWeapon('Blasters'),
                            active: activeWeapon === 'Blasters',
                        },

                        {
                            title: 'Rocket Lance',
                            action: () => setActiveWeapon('Rocket Lance'),
                            active: activeWeapon === 'Rocket Lance',
                        },
                        {
                            title: 'Spear',
                            action: () => setActiveWeapon('Spear'),
                            active: activeWeapon === 'Spear',
                        },
                        {
                            title: 'Katars',
                            action: () => setActiveWeapon('Katars'),
                            active: activeWeapon === 'Katars',
                        },
                        {
                            title: 'Axe',
                            action: () => setActiveWeapon('Axe'),
                            active: activeWeapon === 'Axe',
                        },
                        {
                            title: 'Bow',
                            action: () => setActiveWeapon('Bow'),
                            active: activeWeapon === 'Bow',
                        },
                        {
                            title: 'Gauntlets',
                            action: () => setActiveWeapon('Gauntlets'),
                            active: activeWeapon === 'Gauntlets',
                        },
                        {
                            title: 'Scythe',
                            action: () => setActiveWeapon('Scythe'),
                            active: activeWeapon === 'Scythe',
                        },
                        {
                            title: 'Cannon',
                            action: () => setActiveWeapon('Cannon'),
                            active: activeWeapon === 'Cannon',
                        },
                        {
                            title: 'Orb',
                            action: () => setActiveWeapon('Orb'),
                            active: activeWeapon === 'Orb',
                        },
                    ]
                }
            />
            <PageContentWrapper pTop={activeTab === '#legends' ? '10rem' : '6.5rem'} pBtm="3.5rem">
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
