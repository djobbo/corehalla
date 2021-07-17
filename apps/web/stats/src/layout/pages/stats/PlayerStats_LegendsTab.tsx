import styles from '~styles/pages/stats/PlayerStatsPage.module.scss';
import layoutStyles from '~layout/Layout.module.scss';

import { ILegendStatsFormat, IPlayerStatsFormat, Weapon } from '@corehalla/types';
import { SectionSeparator, PageSection } from '@PageSection';
import { formatTime } from '~util';
import { SectionOverallStatsContent } from '@SectionOverallStatsContent';
import { SectionSeasonOverviewContent } from '@SectionSeasonOverviewContent';
import { StatDesc, StatSmall } from '@TextStyles';
import { useFilter } from '~hooks/useFilter';
import { useSort } from '~hooks/useSort';
import { Select } from '@Select';
import { Card } from '@Card';

export type LegendSort =
    | 'level'
    | 'matchtime'
    | 'rating'
    | 'peak'
    | 'games'
    | 'winrate'
    | 'ranked games'
    | 'ranked winrate';

interface Props {
    playerStats: IPlayerStatsFormat;
}

export const LegendsTab = ({ playerStats }: Props): JSX.Element => {
    const [filterByWeapon, setWeaponFilter] = useFilter<Weapon, ILegendStatsFormat>((weapon) => ({ weapons }) =>
        [weapons.weaponOne.name, weapons.weaponTwo.name].includes(weapon),
    );

    const {
        sort: sortByProp,
        setActiveSort: setSortingProp,
        getDisplayStr: getSortDisplayStr,
        order: sortOrder,
        setOrder: setSortOrder,
    } = useSort<LegendSort, ILegendStatsFormat>(
        'level',
        {
            matchtime: (legend) => legend.matchtime,
            rating: (legend) => legend.season.rating,
            peak: (legend) => legend.season.peak,
            games: (legend) => legend.games,
            winrate: (legend) => (legend.games <= 0 ? 0 : legend.wins / legend.games),
            'ranked games': (legend) => legend.season.games,
            'ranked winrate': (legend) => (legend.season.games <= 0 ? 0 : legend.season.wins / legend.season.games),
            level: (legend) => legend.xp,
        },
        {
            matchtime: (legend) => `Time Played: ${formatTime(legend.matchtime)}`,
            rating: (legend) => `${legend.season.rating} elo`,
            peak: (legend) => `${legend.season.peak} peak elo`,
            games: (legend) => `${legend.games} games`,
            winrate: (legend) => (legend.games <= 0 ? `N/A` : `${((legend.wins / legend.games) * 100).toFixed(2)}%`),
            'ranked games': (legend) => `${legend.season.games} games`,
            'ranked winrate': (legend) =>
                legend.season.games <= 0 ? `N/A` : `${((legend.season.wins / legend.season.games) * 100).toFixed(2)}%`, // TODO: winrate ch.js,
            level: (legend) => `Level ${legend.level}`,
        },
    );

    return (
        <>
            <Card className={layoutStyles.sortAndFilterContainer}>
                <Select<LegendSort>
                    onChange={(value) => {
                        console.log({ value });
                        setSortingProp(value);
                    }}
                    options={[
                        {
                            value: 'level',
                            label: 'Level / XP',
                        },
                        {
                            value: 'matchtime',
                            label: 'Time Played',
                        },
                        {
                            value: 'rating',
                            label: 'Rating',
                        },
                        {
                            value: 'peak',
                            label: 'Peak Rating',
                        },
                        {
                            value: 'games',
                            label: 'Games',
                        },
                        {
                            value: 'winrate',
                            label: 'Winrate',
                        },
                        {
                            value: 'ranked games',
                            label: 'Ranked Games',
                        },
                        {
                            value: 'ranked winrate',
                            label: 'Ranked Winrate',
                        },
                    ]}
                    defaultValue={{
                        value: 'level',
                        label: 'Level / XP',
                    }}
                />
                <Select<Weapon>
                    onChange={(value) => setWeaponFilter(value)}
                    options={[
                        { value: null, label: 'All Weapons' },
                        { value: 'Hammer' },
                        { value: 'Sword' },
                        { value: 'Blasters' },
                        { value: 'Rocket Lance' },
                        { value: 'Spear' },
                        { value: 'Katars' },
                        { value: 'Axe' },
                        { value: 'Bow' },
                        { value: 'Gauntlets' },
                        { value: 'Scythe' },
                        { value: 'Cannon' },
                        { value: 'Orb' },
                        { value: 'Greatsword' },
                    ]}
                    placeholder="All Weapons"
                    clearable
                />
                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>Reverse Order</button>
            </Card>
            {sortByProp(filterByWeapon(playerStats.legends)).map((legend, i) => (
                <>
                    <PageSection key={legend.id} title={`${i + 1}. ${legend.name} • ${getSortDisplayStr(legend)}`}>
                        <div className={styles.legendLevelStats}>
                            <img className={styles.legendIcon} src={`/images/icons/legends/${legend.name}.png`} />
                            <div>
                                <div>
                                    <StatDesc>Level</StatDesc>
                                    <StatSmall>{legend.level}</StatSmall>
                                    <StatDesc>({legend.xp}xp)</StatDesc>
                                </div>
                                <div>
                                    <StatDesc>Time played</StatDesc>
                                    <StatSmall>{formatTime(legend.matchtime)}</StatSmall>
                                </div>
                            </div>
                        </div>
                        <SectionSeasonOverviewContent
                            {...legend.season}
                            losses={legend.season.games - legend.season.wins}
                            winrate={(legend.season.wins / legend.season.games) * 100}
                        />
                        <SectionOverallStatsContent {...legend} losses={legend.games - legend.wins} />
                    </PageSection>
                    <SectionSeparator />
                </>
            ))}
        </>
    );
};
