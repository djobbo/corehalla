// Library imports
import React, { FC } from 'react';
import styled from 'styled-components';
import { IRanking1v1Format, IRanking2v2Format } from 'corehalla.js';

import { StatLarge, StatDesc, StatSmall, StatMedium } from './TextStyles';
import { BarChart } from './Charts';
import { Link } from 'react-router-dom';

const BarChartWrapper = styled.div`
    display: flex;
    align-items: center;

    span {
        margin-left: 1rem;
    }
`;

const StatsWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Wrapper = styled.div`
    margin: 0.5rem 0;
`;

interface Props1v1 {
    player: IRanking1v1Format;
}

export const RankingsItem1v1: FC<Props1v1> = ({ player }: Props1v1) => {
    return (
        <Wrapper>
            <StatsWrapper>
                <div>
                    <Link to={`/stats/player/${player.id}`}>
                        <StatMedium>{player.name}</StatMedium>
                    </Link>
                    <p>
                        <StatSmall>{player.games}</StatSmall>
                        <StatDesc>games</StatDesc>
                        <StatSmall>
                            ({player.wins}W-{player.games - player.wins}L)
                        </StatSmall>
                    </p>
                </div>
                <div>
                    <StatLarge>{player.rating}</StatLarge>
                    <p>
                        <StatSmall>{player.peak}</StatSmall>
                        <StatDesc>peak</StatDesc>
                    </p>
                </div>
            </StatsWrapper>
            <BarChartWrapper>
                <BarChart width="100%" amount={(player.wins / player.games) * 100} height="0.25rem" bg="var(--bg-1)" />
                <StatDesc>{((player.wins / player.games) * 100).toFixed(2)}%</StatDesc>
            </BarChartWrapper>
        </Wrapper>
    );
};

interface Props2v2 {
    team: IRanking2v2Format;
}

export const RankingsItem2v2: FC<Props2v2> = ({ team }: Props2v2) => {
    return (
        <Wrapper>
            <StatsWrapper>
                <div>
                    <Link to={`/stats/player/${team.players[0].id}`}>
                        <StatMedium>{team.players[0].name}</StatMedium>
                    </Link>
                    <Link to={`/stats/player/${team.players[1].id}`}>
                        <StatMedium>{team.players[1].name}</StatMedium>
                    </Link>
                    <p>
                        <StatSmall>{team.games}</StatSmall>
                        <StatDesc>games</StatDesc>
                        <StatSmall>
                            ({team.wins}W-{team.games - team.wins}L)
                        </StatSmall>
                    </p>
                </div>
                <div>
                    <StatLarge>{team.rating}</StatLarge>
                    <p>
                        <StatSmall>{team.peak}</StatSmall>
                        <StatDesc>peak</StatDesc>
                    </p>
                </div>
            </StatsWrapper>
            <BarChartWrapper>
                <BarChart width="100%" amount={(team.wins / team.games) * 100} height="0.25rem" bg="var(--bg-1)" />
                <StatDesc>{((team.wins / team.games) * 100).toFixed(2)}%</StatDesc>
            </BarChartWrapper>
        </Wrapper>
    );
};
