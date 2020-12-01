// Library imports
import React, { FC } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Components imports
import { StatDesc, StatSmall } from './TextStyles';
import { Card } from './Card';
import { BarChart } from './Charts';
import type { I2v2TeamFormat } from 'corehalla';

interface Props {
    team: I2v2TeamFormat;
}

const TeammateName = styled(Link)`
    font-size: 1rem;
    color: var(--text);
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.125rem;
    font-weight: bold;

    &:hover {
        color: var(--accent);
    }
`;

const RegionIcon = styled.img`
    width: 1rem;
    height: auto;
    border-radius: 0.25rem;
    margin-right: 0.5rem;
`;

const RankedIcon = styled.img`
    width: 4rem;
    height: 4rem;
    border-radius: 0.5rem;
    margin-right: 1rem;
`;

const StatsContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
`;

const WinLossContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0.75rem;
`;

export const TeamCard: FC<Props> = ({ team }: Props) => {
    return (
        <Card>
            <TeammateName to={`/stats/player/${team.teammate.id}`}>
                <RegionIcon src={`/cdn/images/icons/flags/${team.region}.png`} alt={team.region} />
                {team.teammate.name}
            </TeammateName>
            <StatsContainer>
                <RankedIcon src={`/cdn/images/icons/ranked/${team.season.tier}.png`} alt={team.region} />
                <div>
                    <div>
                        <StatSmall>{team.season.rating}</StatSmall>
                        <StatDesc>rating</StatDesc>
                    </div>
                    <div>
                        <StatSmall>{team.season.peak}</StatSmall>
                        <StatDesc>peak</StatDesc>
                    </div>
                    <div>
                        <StatSmall>{((team.season.wins / team.season.games) * 100).toFixed(2)}%</StatSmall>
                        <StatDesc>winrate</StatDesc>
                    </div>
                    <div>
                        <StatSmall>{team.season.ratingSquash}</StatSmall>
                        <StatDesc>elo squash</StatDesc>
                    </div>
                </div>
            </StatsContainer>
            <BarChart width="100%" height="1rem" amount={(team.season.wins / team.season.games) * 100} />
            <WinLossContainer>
                <StatSmall>{team.season.games}</StatSmall>
                <StatDesc>games</StatDesc>
                <StatSmall>
                    {team.season.wins}W-{team.season.games - team.season.wins}L
                </StatSmall>
            </WinLossContainer>
        </Card>
    );
};
