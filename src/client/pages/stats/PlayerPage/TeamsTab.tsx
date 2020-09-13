import React, { FC, useState } from 'react';
import styled from 'styled-components';

import { I2v2TeamFormat } from 'corehalla.js';

import { PageSection, SectionSeparator } from '../../../components/PageSection';
import { MiscStatContainer } from '../../../components/MiscStat';
import { GamesStatsCard } from '../../../components/GamesStatsCard';
import { TeamCard } from '../../../components/TeamCard';
import { Select } from '../../../components/Select';
import { motion } from 'framer-motion';

interface Props {
    teams: I2v2TeamFormat[];
}

const CardsWrapper = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: 1rem;
`;

type TeamsSort = 'default' | 'peak' | 'games' | 'winrate' | 'wins' | 'losses';

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

// TODO: global/total team stats in ch.js
export const TeamsTab: FC<Props> = ({ teams }: Props) => {
    const [sort, setSort] = useState<TeamsSort>('default');

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
        <>
            {teams.length > 0 ? (
                <>
                    <PageSection title="2v2 overview" initFoldState={true}>
                        <GamesStatsCard
                            {...totalTeamsStats}
                            losses={totalTeamsStats.games - totalTeamsStats.wins}
                            winrate={(totalTeamsStats.winrateAcc / teams.length) * 100}
                        />
                        <MiscStatContainer stats={[]} />
                    </PageSection>
                    <SectionSeparator />
                    <Select<TeamsSort>
                        action={setSort}
                        title="Sort by"
                        options={[
                            { name: 'Rating', value: 'default' },
                            { name: 'Peak Rating', value: 'peak' },
                            { name: 'Games', value: 'games' },
                            { name: 'Wins', value: 'wins' },
                            { name: 'Losses', value: 'losses' },
                            { name: 'Winrate', value: 'winrate' },
                        ]}
                    />
                    <PageSection title="teams" initFoldState={true}>
                        <CardsWrapper>
                            {teams
                                .sort((a, b) => (getSortedProp(sort, a) < getSortedProp(sort, b) ? 1 : -1))
                                .map((team) => (
                                    <motion.div layout key={team.teammate.id}>
                                        <TeamCard team={team} />
                                    </motion.div>
                                ))}
                        </CardsWrapper>
                    </PageSection>
                </>
            ) : (
                `No teams`
            )}
        </>
    );
};
