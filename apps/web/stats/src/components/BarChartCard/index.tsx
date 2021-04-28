import styles from './index.module.scss';

// Components imports
import { Card } from '@Card';
import { BarChart } from '@Charts';
import { StatDesc, StatSmall } from '@TextStyles';

interface BarChartStat {
    title: string;
    amount: number;
    max: number;
}

interface Props {
    title: string;
    stats: BarChartStat[];
}

export function BarChartCard({ title, stats }: Props): JSX.Element {
    return (
        <Card title={title}>
            {stats.map(({ title: statTitle, amount, max }, i) => (
                <div className={styles.container} key={i}>
                    <div className={styles.meta}>
                        <StatSmall>{amount}</StatSmall>
                        <StatDesc>{statTitle}</StatDesc>
                    </div>
                    <BarChart width="100%" height="0.25rem" amount={(amount / max) * 100} />
                </div>
            ))}
        </Card>
    );
}
