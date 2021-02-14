import styles from './GamesStatsCard.module.scss';
// Components imports
import { Card } from './Card';
import { PieChart } from './Charts';
import { StatLarge, StatDesc, StatSmall } from '@components/TextStyles';

interface Props {
	games: number;
	wins: number;
	losses: number;
	winrate: number;
}

export function GamesStatsCard({ games, wins, losses, winrate }: Props) {
	return (
		<Card title='games'>
			<div className={styles.container}>
				<div className={styles.stats}>
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
				<PieChart
					width='10rem'
					height='10rem'
					amount={(wins / games) * 100}
				/>
			</div>
		</Card>
	);
}
