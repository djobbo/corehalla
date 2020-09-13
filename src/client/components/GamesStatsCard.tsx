// Library imports
import React, { FC } from 'react';
import styled from 'styled-components';

// Components imports
import { Card } from './Card';
import { PieChart } from './Charts';
import { StatLarge, StatDesc, StatSmall } from './TextStyles';

interface Props {
    games: number;
    wins: number;
    losses: number;
    winrate: number;
}

const GamesStatsCardWrapper = styled.div`
    display: flex;
    justify-content: space-between;
`;

const StatsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

export const GamesStatsCard: FC<Props> = ({ games, wins, losses, winrate }: Props) => {
    return (
        <Card title="games">
            <GamesStatsCardWrapper>
                <StatsWrapper>
                    <div>
                        <StatLarge>{games}</StatLarge>
                        <StatDesc>games</StatDesc>
                    </div>
                    <div>
                        <StatSmall>{wins}</StatSmall>
                        <StatDesc>wins</StatDesc>
                    </div>
                    <div>
                        <StatSmall>{losses}</StatSmall>
                        <StatDesc>losses</StatDesc>
                    </div>
                    <div>
                        <StatSmall>{winrate.toFixed(2)}%</StatSmall>
                        <StatDesc>winrate</StatDesc>
                    </div>
                </StatsWrapper>
                <PieChart width="10rem" height="10rem" amount={(wins / games) * 100} />
            </GamesStatsCardWrapper>
        </Card>
    );
};
