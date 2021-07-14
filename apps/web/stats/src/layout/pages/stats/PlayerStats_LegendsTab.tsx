import styles from '~styles/pages/stats/PlayerStatsPage.module.scss';
import { ILegendStatsFormat, IPlayerStatsFormat, Weapon } from '@corehalla/types';
import { SectionSeparator, PageSection } from '@PageSection';
import { motion } from 'framer-motion';
import { formatTime } from '~util';
import { SectionOverallStatsContent } from '@SectionOverallStatsContent';
import { SectionSeasonOverviewContent } from '@SectionSeasonOverviewContent';
import { StatDesc, StatSmall } from '@TextStyles';
import { useFilter } from '~hooks/useFilter';
import { useSort } from '~hooks/useSort';
import Select from 'react-select';
import { Card } from '~/components/Card';

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
            <Card>
                <Select<LegendSort>
                    action={(selected) => setSortingProp(selected)}
                    options={[
                        {
                            option: 'matchtime',
                            displayName: 'Time Played',
                        },
                        {
                            option: 'rating',
                            displayName: 'Rating',
                        },
                        {
                            option: 'peak',
                            displayName: 'Peak Rating',
                        },
                        {
                            option: 'games',
                            displayName: 'Games',
                        },
                        {
                            option: 'winrate',
                            displayName: 'Winrate',
                        },
                        {
                            option: 'ranked games',
                            displayName: 'Ranked Games',
                        },
                        {
                            option: 'ranked winrate',
                            displayName: 'Ranked Winrate',
                        },
                        {
                            option: 'level',
                            displayName: 'Level / XP',
                        },
                    ]}
                />
                <Select<Weapon>
                    action={(selected) => setWeaponFilter(selected)}
                    options={[
                        { option: null, displayName: 'All Weapons' },
                        { option: 'Hammer' },
                        { option: 'Sword' },
                        { option: 'Blasters' },
                        { option: 'Rocket Lance' },
                        { option: 'Spear' },
                        { option: 'Katars' },
                        { option: 'Axe' },
                        { option: 'Bow' },
                        { option: 'Gauntlets' },
                        { option: 'Scythe' },
                        { option: 'Cannon' },
                        { option: 'Orb' },
                        { option: 'Greatsword' },
                    ]}
                />
            </Card>
            <button onClick={() => setSortingProp('peak')}>XD</button>
            <br />
            <button onClick={() => setSortingProp('winrate')}>XDDDD</button>
            <br />
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>Reverse</button>
            {sortByProp(filterByWeapon(playerStats.legends)).map((legend, i) => (
                <motion.div layoutId={`legend_${legend.id}`} key={legend.id}>
                    <SectionSeparator />
                    <PageSection title={`${i + 1}. ${legend.name} • ${getSortDisplayStr(legend)}`}>
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
                </motion.div>
            ))}
        </>
    );
};
