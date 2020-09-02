import React, { FC } from 'react';

import { Card } from '../../components/Card';
import { PieChart } from '../../components/Charts/PieChart';
import { StatLarge, StatDesc, StatSmall } from '../../components/TextStyles';

interface Props {
    games: number;
    wins: number;
    losses: number;
    winrate: number;
}

export const GamesStatsCard: FC<Props> = ({ games, wins, losses, winrate }: Props) => {
    return (
        <Card title="games">
            <div>
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
            </div>
            <PieChart width="12rem" height="12rem" amount={(wins / games) * 100} />
        </Card>
    );
};
