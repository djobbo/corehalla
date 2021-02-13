import styles from '@styles/pages/RankingsPage.module.scss';
import { GetServerSideProps } from 'next';
import type { IRanking1v1Format, RankedRegion } from 'corehalla';
import { RankingsLayout, getRankingsProps } from '@layout/pages/RankingsLayout';
import { motion } from 'framer-motion';
import { SectionSeparator } from '@components/PageSection';
import { RankingsItem1v1 } from '@components/RankingsItem';

export interface Props {
	bracket: '1v1';
	region: RankedRegion;
	page: string;
	playerSearch: string;
	rankings: IRanking1v1Format[];
}

export default function RankingsPage({
	rankings,
	region,
	page,
	bracket,
	playerSearch,
}: Props) {
	return (
		<RankingsLayout
			rankings={rankings}
			bracket={bracket}
			region={region}
			page={page}
			playerSearch={playerSearch}
		>
			<div className={styles.container}>
				{rankings.map((player, i) => (
					<motion.div layout key={player.id}>
						{i !== 0 && <SectionSeparator />}
						<RankingsItem1v1 key={i} player={player} />
					</motion.div>
				))}
			</div>
		</RankingsLayout>
	);
}

export const getServerSideProps: GetServerSideProps<
	Props,
	{ rankingsOptions: [region: RankedRegion, page: string] }
> = getRankingsProps('1v1');
