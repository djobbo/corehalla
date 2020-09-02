import React, { FC } from 'react';

import { Card } from '../../components/Card';
import { BarChart } from '../../components/Charts/BarChart';
import { StatDesc, StatSmall } from '../../components/TextStyles';

interface BarChartStat {
    title: string;
    amount: number;
    max: number;
}

interface Props {
    title: string;
    stats: BarChartStat[];
}

export const BarChartCard: FC<Props> = ({ title, stats }: Props) => {
    return (
        <Card title={title}>
            {stats.map(({ title: statTitle, amount, max }, i) => (
                <div key={i}>
                    <div>
                        <StatSmall>{amount}</StatSmall>
                        <StatDesc>{statTitle}</StatDesc>
                    </div>
                    <BarChart width="100%" height="0.25rem" amount={(amount / max) * 100} />
                </div>
            ))}
        </Card>
    );
};
