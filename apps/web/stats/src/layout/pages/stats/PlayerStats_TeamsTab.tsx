import styles from '~styles/pages/stats/PlayerStatsPage.module.scss';
import type { I2v2TeamFormat, IPlayerStatsFormat } from '@corehalla/types';
import { SectionSeparator, PageSection } from '@PageSection';
import { motion } from 'framer-motion';
import { GamesStatsCard } from '@GamesStatsCard';
import { MiscStats } from '@MiscStats';
import { TeamCard } from '~components/TeamCard';
import { ITabComponent } from '~layout/TabLayout';

export type TeamsSort = 'rating' | 'peak' | 'games' | 'winrate' | 'wins' | 'losses';

const getSortedProp = (state: TeamsSort, teamStats: I2v2TeamFormat) => {
    switch (state) {
        case 'peak':
            return teamStats.season.peak;
        case 'games':
            return teamStats.season.games;
        case 'wins':
            return teamStats.season.wins;
        case 'losses':
            return teamStats.season.games - teamStats.season.wins; // TODO: ch.js
        case 'winrate':
            return teamStats.season.games <= 0 ? 0 : teamStats.season.wins / teamStats.season.games; // TODO: ch.js
        default:
            return teamStats.season.rating;
    }
};

export const TeamsTab = (playerStats: IPlayerStatsFormat): ITabComponent<never, never> => {
    const Tab: ITabComponent<never, never> = (
        active: boolean,
        _: never,
        sort: TeamsSort, // TODO: arglist => {}:TabsProps
    ): JSX.Element => {
        const {
            season: { teams },
        } = playerStats;

        const totalTeamsStats = teams.reduce(
            (acc, team) => ({
                games: acc.games + team.season.games,
                wins: acc.wins + team.season.wins,
                ratingAcc: acc.ratingAcc + team.season.rating,
                peakAcc: acc.peakAcc + team.season.peak,
                ratingAccPond: {
                    rating: acc.ratingAccPond.rating + team.season.games * team.season.peak,
                    peak: acc.ratingAccPond.peak + team.season.games * team.season.rating,
                    total: acc.ratingAccPond.total + team.season.games,
                },
                winrateAcc: acc.winrateAcc + team.season.wins / team.season.games,
            }),
            {
                games: 0,
                wins: 0,
                ratingAcc: 0,
                peakAcc: 0,
                ratingAccPond: { rating: 0, peak: 0, total: 0 },
                winrateAcc: 0,
            },
        );
        return (
            active && (
                <>
                    {teams.length > 0 ? (
                        <>
                            <PageSection title="2v2 overview" initFoldState={true}>
                                <GamesStatsCard
                                    {...totalTeamsStats}
                                    losses={totalTeamsStats.games - totalTeamsStats.wins}
                                    winrate={(totalTeamsStats.winrateAcc / teams.length) * 100}
                                />
                                <MiscStats stats={[]} />
                            </PageSection>
                            <SectionSeparator />
                            <PageSection title="teams" initFoldState={true}>
                                <div className={styles.teamsContainer}>
                                    {teams
                                        .sort((a, b) => (getSortedProp(sort, a) < getSortedProp(sort, b) ? 1 : -1))
                                        .map((team) => (
                                            <motion.div layoutId={`team_${team.teammate.id}`} key={team.teammate.id}>
                                                <TeamCard team={team} />
                                            </motion.div>
                                        ))}
                                </div>
                            </PageSection>
                        </>
                    ) : (
                        `No teams`
                    )}
                </>
            )
        );
    };
    return Tab;
};
