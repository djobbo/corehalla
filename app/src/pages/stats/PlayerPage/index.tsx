// Library imports
import React, { FC } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import loadable from '@loadable/component';

// Hooks
import { useFetchData } from '../../../hooks/useFetchData';
import { useMockData } from '../../../hooks/useMockData';

// Layout imports
import { MainLayout } from '../../../layout';
import type { IPlayerStatsFormat, Weapon } from 'corehalla';

// Tabs imports
const OverviewTab = loadable(() => import('./OverviewTab'), {
    resolveComponent: (mod) => mod.OverviewTab,
});
const TeamsTab = loadable(() => import('./TeamsTab'), {
    resolveComponent: (mod) => mod.TeamsTab,
});
const LegendsTab = loadable(() => import('./LegendsTab'), {
    resolveComponent: (mod) => mod.LegendsTab,
});

type PlayerStatsTab = 'overview' | 'teams' | 'legends' | 'weapons';

export const PlayerPage: FC = () => {
    // Fetch Clan ID
    const { id: playerId } = useParams<{ id: string }>();

    // Fetch Player Stats
    const [playerStats, loading] =
        process.env.NODE_ENV === 'production'
            ? useFetchData<IPlayerStatsFormat>(`/api/stats/player/${playerId}`)
            : useMockData<IPlayerStatsFormat>('PlayerStats', 0);

    const renderOverviewTab = () => <OverviewTab playerStats={playerStats} />;

    const renderTeamsTab = () => <TeamsTab {...playerStats.season} />;

    const renderLegendsTab = (activeWeapon: Weapon | 'all') => (
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

    const renderWeaponsTab = () => <OverviewTab playerStats={playerStats} />; // TODO: Weapons Tab

    return (
        <>
            {!loading && (
                <Helmet>
                    <title>{playerStats.name} Stats • Corehalla</title>
                </Helmet>
            )}
            <MainLayout<PlayerStatsTab, Weapon | 'all'> // TODO: <,U> U is not type safe
                title={loading ? 'loading' : playerStats.name || 'Corehalla'}
                tabs={{
                    overview: {
                        render: renderOverviewTab,
                        displayName: 'Overview',
                    },
                    teams: {
                        render: renderTeamsTab,
                        displayName: 'Teams',
                    },
                    legends: {
                        render: renderLegendsTab,
                        displayName: 'Legends',
                        chips: [
                            { chipName: 'all', displayName: 'All' },
                            { chipName: 'Hammer' },
                            { chipName: 'Sword' },
                            { chipName: 'Blasters' },
                            { chipName: 'Rocket Lance' },
                            { chipName: 'Spear' },
                            { chipName: 'Katars' },
                            { chipName: 'Axe' },
                            { chipName: 'Bow' },
                            { chipName: 'Gauntlets' },
                            { chipName: 'Scythe' },
                            { chipName: 'Cannon' },
                            { chipName: 'Orb' },
                            { chipName: 'Greatsword' },
                        ],
                        defaultChip: 'all',
                    },
                    weapons: {
                        render: renderWeaponsTab,
                        displayName: 'Weapons',
                    },
                }}
                defaultTab="overview"
                loading={loading}
            ></MainLayout>
        </>
    );
};
