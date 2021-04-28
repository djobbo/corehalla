import styles from './RankingsItem.module.scss';
// Library imports
import Link from 'next/link';

import { StatLarge, StatDesc, StatSmall, StatMedium } from './TextStyles';
import { BarChart } from './Charts';
import type { IRanking1v1Format } from 'corehalla';

interface Props1v1 {
	player: IRanking1v1Format;
}

export function RankingsItem1v1({ player }: Props1v1) {
	return (
		<div className={styles.container}>
			<div className={styles.stats}>
				<div>
					<Link href={`/stats/player/${player.id}`}>
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
				<div className={styles.largeStat}>
					<StatLarge>{player.rating}</StatLarge>
					<p>
						<StatSmall>{player.peak}</StatSmall>
						<StatDesc>peak</StatDesc>
					</p>
				</div>
			</div>
			<div className={styles.barChart}>
				<BarChart
					width='100%'
					amount={(player.wins / player.games) * 100}
					height='0.25rem'
				/>
				<div className={styles.barChartLabel}>
					<StatDesc>
						{((player.wins / player.games) * 100).toFixed(2)}%
					</StatDesc>
				</div>
			</div>
		</div>
	);
}
