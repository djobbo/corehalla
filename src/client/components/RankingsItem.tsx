// Library imports
import React, { FC } from 'react';
import styled from 'styled-components';
import { IClanMember, IClanMemberFormat, IRanking1v1Format, IRanking2v2Format } from 'corehalla.js';

import { StatLarge, StatDesc, StatSmall, StatMedium } from './TextStyles';
import { BarChart } from './Charts';
import { Link } from 'react-router-dom';

import { formatEpoch } from '../util';

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
    padding: 0.25rem 0.5rem;
    margin: 0.25rem 0;
`;

const LargeStatWrapper = styled.div`
    text-align: right;
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
                        <StatMedium>
                            {player.rank} - {player.name}
                        </StatMedium>
                    </Link>
                    <p>
                        <StatSmall>{player.games}</StatSmall>
                        <StatDesc>games</StatDesc>
                        <StatSmall>
                            ({player.wins}W-{player.games - player.wins}L)
                        </StatSmall>
                    </p>
                </div>
                <LargeStatWrapper>
                    <StatLarge>{player.rating}</StatLarge>
                    <p>
                        <StatSmall>{player.peak}</StatSmall>
                        <StatDesc>peak</StatDesc>
                    </p>
                </LargeStatWrapper>
            </StatsWrapper>
            <BarChartWrapper>
                <BarChart width="100%" amount={(player.wins / player.games) * 100} height="0.25rem" bg="var(--bg)" />
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
                <LargeStatWrapper>
                    <StatLarge>{team.rating}</StatLarge>
                    <p>
                        <StatSmall>{team.peak}</StatSmall>
                        <StatDesc>peak</StatDesc>
                    </p>
                </LargeStatWrapper>
            </StatsWrapper>
            <BarChartWrapper>
                <BarChart width="100%" amount={(team.wins / team.games) * 100} height="0.25rem" bg="var(--bg)" />
                <StatDesc>{((team.wins / team.games) * 100).toFixed(2)}%</StatDesc>
            </BarChartWrapper>
        </Wrapper>
    );
};

interface PropsClan {
    player: IClanMemberFormat;
    clanXP: number;
}

export const RankingsItemClan: FC<PropsClan> = ({ player, clanXP }: PropsClan) => {
    return (
        <Wrapper>
            <StatsWrapper>
                <div>
                    <Link to={`/stats/player/${player.id}`}>
                        <StatMedium>{player.name}</StatMedium>
                    </Link>
                    <p>
                        <StatDesc>Member since </StatDesc>
                        <StatSmall>{formatEpoch(player.joinDate)}</StatSmall>
                    </p>
                </div>
                <LargeStatWrapper>
                    <StatLarge>{player.xp}</StatLarge>
                    <StatDesc>xp</StatDesc>
                    <p>
                        <StatSmall>{player.rank}</StatSmall>
                    </p>
                </LargeStatWrapper>
            </StatsWrapper>
            <BarChartWrapper>
                <BarChart width="100%" amount={(player.xp / clanXP) * 100} height="0.25rem" bg="var(--bg)" />
                <StatDesc>{((player.xp / clanXP) * 100).toFixed(2)}%</StatDesc>
            </BarChartWrapper>
        </Wrapper>
    );
};
