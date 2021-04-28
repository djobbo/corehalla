import styles from './index.module.scss';
// Library imports
import { motion } from 'framer-motion';

// Components imports
import { StatSmall, StatMedium, StatLarge, StatDesc } from '@TextStyles';

interface Props {
	tier: string;
	rating: number;
	peak: number;
	games: number;
	wins: number;
	losses: number;
	winrate: number;
	ratingSquash: number;
	region?: string;
}

export function SectionSeasonOverviewContent({
	tier,
	rating,
	peak,
	games,
	wins,
	losses,
	winrate,
	ratingSquash,
	region,
}: Props) {
	return (
		<div className={styles.container}>
			<motion.img
				className={styles.rankedBanner}
				src={`/images/ranked-banners/${tier}.png`}
				alt={tier}
				animate={{
					scaleX: [0.86, 0.91, 0.91, 0.86, 0.86, 0.86],
					scaleY: [0.86, 1, 0.82, 0.91, 0.86, 0.86],
				}}
				style={{ originY: 0 }}
				transition={{
					ease: 'easeInOut',
					repeat: Infinity,
					times: [0, 0.03, 0.06, 0.08, 0.1, 1],
					duration: 5,
				}}
			/>
			<div className={styles.stats}>
				<div>
					<StatDesc>tier</StatDesc>
					<StatLarge>{tier.toUpperCase()}</StatLarge>
				</div>
				<div>
					<StatDesc>elo</StatDesc>
					<StatMedium>{rating}</StatMedium>
				</div>
				<div>
					<StatDesc>peak</StatDesc>
					<StatSmall>{peak}</StatSmall>
				</div>
				<hr className={styles.separator} />
				<div>
					<StatSmall>{games}</StatSmall>
					<StatDesc>games</StatDesc>
					<StatSmall>{`(${wins}W-${losses}L)`}</StatSmall>
				</div>
				<div>
					<StatDesc>winrate</StatDesc>
					<StatSmall>{`${winrate.toFixed(2)}%`}</StatSmall>
				</div>
				<hr className={styles.separator} />
				<div>
					<StatDesc>elo squash</StatDesc>
					<StatSmall>{ratingSquash}</StatSmall>
				</div>
				{region && (
					<img
						className={styles.regionIcon}
						src={`/images/icons/flags/${region}.png`}
						alt='Region Flag'
						width='32px'
						height='32px'
					/>
				)}
			</div>
		</div>
	);
}
