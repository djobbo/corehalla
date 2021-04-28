import styles from '~styles/pages/stats/PlayerStatsPage.module.scss';
import {
	ILegendStatsFormat,
	IPlayerStatsFormat,
	Weapon,
} from '@corehalla/types';
import { SectionSeparator, PageSection } from '@PageSection';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Select } from '@Select';
import { formatTime } from '~util';
import { SectionOverallStatsContent } from '@SectionOverallStatsContent';
import { SectionSeasonOverviewContent } from '@SectionSeasonOverviewContent';
import { StatDesc, StatSmall } from '@TextStyles';

export type LegendSort =
	| 'level'
	| 'matchtime'
	| 'rating'
	| 'peak'
	| 'games'
	| 'winrate'
	| 'ranked games'
	| 'ranked winrate';

const getSortedProp = (state: LegendSort, legendStats: ILegendStatsFormat) => {
	switch (state) {
		case 'matchtime':
			return legendStats.matchtime;
		case 'rating':
			return legendStats.season.rating;
		case 'peak':
			return legendStats.season.peak;
		case 'games':
			return legendStats.games;
		case 'winrate':
			return legendStats.games <= 0
				? 0
				: legendStats.wins / legendStats.games;
		case 'ranked games':
			return legendStats.season.games;
		case 'ranked winrate':
			return legendStats.season.games <= 0
				? 0
				: legendStats.season.wins / legendStats.season.games;
		default:
			return legendStats.xp;
	}
};

const getSortedDisplay = (
	state: LegendSort,
	legendStats: ILegendStatsFormat
) => {
	switch (state) {
		case 'matchtime':
			return `Time Played: ${formatTime(legendStats.matchtime)}`;
		case 'rating':
			return `${legendStats.season.rating} elo`;
		case 'peak':
			return `${legendStats.season.peak} peak elo`;
		case 'games':
			return `${legendStats.games} games`;
		case 'winrate':
			return legendStats.games <= 0
				? `N/A`
				: `${((legendStats.wins / legendStats.games) * 100).toFixed(
						2
				  )}%`;
		case 'ranked games':
			return `${legendStats.season.games} games`;
		case 'ranked winrate':
			return legendStats.season.games <= 0
				? `N/A`
				: `${(
						(legendStats.season.wins / legendStats.season.games) *
						100
				  ).toFixed(2)}%`; // TODO: winrate ch.js
		default:
			return `Level ${legendStats.level}`;
	}
};

export const LegendsTab = (playerStats: IPlayerStatsFormat) => (
	active: boolean,
	activeWeapon: Weapon | 'all',
	sort: LegendSort
) => {
	const legends =
		activeWeapon === 'all'
			? playerStats.legends
			: playerStats.legends.filter((l) =>
					[
						l.weapons.weaponOne.name,
						l.weapons.weaponTwo.name,
					].includes(activeWeapon)
			  );

	return (
		active && (
			<>
				{/* <Select<LegendSort>
				action={setSort}
				title='Sort by'
				options={[
					{ name: 'Level', value: 'default' },
					{ name: 'Time Played', value: 'matchtime' },
					{ name: 'Rating', value: 'rating' },
					{ name: 'Peak Rating', value: 'peak' },
					{ name: 'Games', value: 'games' },
					{ name: 'Winrate', value: 'winrate' },
					{ name: 'Ranked Games', value: 'ranked games' },
					{ name: 'Ranked Winrate', value: 'ranked winrate' },
				]}
			/> */}
				{legends
					.sort((a, b) =>
						getSortedProp(sort, a) < getSortedProp(sort, b) ? 1 : -1
					)
					.map((legend, i) => (
						<motion.div
							layoutId={`legend_${legend.id}`}
							key={legend.id}
						>
							<SectionSeparator />
							<PageSection
								title={`${i + 1}. ${
									legend.name
								} ${`• ${getSortedDisplay(sort, legend)}`}`}
							>
								<div className={styles.legendLevelStats}>
									<img
										className={styles.legendIcon}
										src={`/images/icons/legends/${legend.name}.png`}
									/>
									<div>
										<div>
											<StatDesc>Level</StatDesc>
											<StatSmall>
												{legend.level}
											</StatSmall>
											<StatDesc>({legend.xp}xp)</StatDesc>
										</div>
										<div>
											<StatDesc>Time played</StatDesc>
											<StatSmall>
												{formatTime(legend.matchtime)}
											</StatSmall>
										</div>
									</div>
								</div>
								<SectionSeasonOverviewContent
									{...legend.season}
									losses={
										legend.season.games - legend.season.wins
									}
									winrate={
										(legend.season.wins /
											legend.season.games) *
										100
									}
								/>
								<SectionOverallStatsContent
									{...legend}
									losses={legend.games - legend.wins}
								/>
							</PageSection>
						</motion.div>
					))}
			</>
		)
	);
};
