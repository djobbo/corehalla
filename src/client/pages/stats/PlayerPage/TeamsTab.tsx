import React, { FC } from 'react';
import styled from 'styled-components';

import { I2v2TeamFormat } from 'corehalla.js';

import { PageSection, SectionSeparator } from '../../../components/PageSection';
import { MiscStatContainer } from '../../../components/MiscStat';
import { GamesStatsCard } from '../../../components/GamesStatsCard';
import { TeamCard } from '../../../components/TeamCard';

interface Props {
    teams: I2v2TeamFormat[];
}

const CardsWrapper = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: 1rem;
`;

// TODO: global/total team stats in ch.js
export const TeamsTab: FC<Props> = ({ teams }: Props) => {
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
                    <PageSection title="teams" initFoldState={true}>
                        <CardsWrapper>
                            {teams.map((team, i) => (
                                <TeamCard team={team} key={i} />
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
