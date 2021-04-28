import styles from './index.module.scss';
// Components imports
import { StatDesc } from '@TextStyles';

interface IMiscStat {
	title: string;
	value: string;
}

interface Props {
	stats: IMiscStat[];
}

export function MiscStats({ stats }: Props) {
	return (
		<div className={styles.container}>
			{stats.map(({ title, value }, i) => (
				<p className={styles.miscStat} key={i}>
					<StatDesc>{title}</StatDesc>
					<span className={styles.value}>{value}</span>
				</p>
			))}
		</div>
	);
}
