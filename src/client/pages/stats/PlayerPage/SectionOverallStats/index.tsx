import React from 'react';

import './styles.scss';

import BarChart from '../../../../components/Charts/BarChart';
import PieChart from '../../../../components/Charts/PieChart';

import { IPlayerStatsFormat } from 'corehalla.js';

interface Props {
	playerStats: IPlayerStatsFormat;
}

const SectionOverallStats: React.FC<Props> = ({ playerStats }) => {
	const greatestKOValue = [
		playerStats.kos,
		playerStats.falls,
		playerStats.suicides,
		playerStats.teamkos,
	].reduce((acc, stat) => (stat > acc ? stat : acc), -1);

	const greatestDamageValue =
		playerStats.damageDealt > playerStats.damageTaken
			? playerStats.damageDealt
			: playerStats.damageTaken;

	return (
		<section className='section-overall'>
			<h2 className='section-title'>Overall Stats</h2>
			<div className='stats-container'>
				<div className='card games-stats'>
					<div className='games-stats-container'>
						<div>
							<h3>Games</h3>
							<p>
								<span className='stat stat-large'>
									{playerStats.games}
								</span>
								<span className='stat-desc'> Games</span>
							</p>
							<p>
								<span className='stat'>{playerStats.wins}</span>
								<span className='stat-desc'> Wins</span>
							</p>
							<p>
								<span className='stat'>
									{playerStats.games - playerStats.wins}
								</span>
								<span className='stat-desc'> Losses</span>
							</p>
							<p>
								<span className='stat'>
									{(
										(playerStats.wins / playerStats.games) *
										100
									).toFixed(1)}
									%
								</span>
								<span className='stat-desc'> Winrate</span>
							</p>
						</div>
						<div className='games-pie-chart'>
							<PieChart
								width='12rem'
								height='12rem'
								amount={
									(playerStats.wins / playerStats.games) * 100
								}
							/>
						</div>
					</div>
				</div>
				<div className='card kos-stats'>
					<h3>KOs</h3>
					<div>
						<p>
							<span className='stat'>{playerStats.kos}</span>
							<span className='stat-desc'> KOs</span>
							<BarChart
								amount={
									(playerStats.kos / greatestKOValue) * 100
								}
							/>
						</p>
						<p>
							<span className='stat'>{playerStats.falls}</span>
							<span className='stat-desc'> Falls</span>
							<BarChart
								amount={
									(playerStats.falls / greatestKOValue) * 100
								}
							/>
						</p>
						<p>
							<span className='stat'>{playerStats.suicides}</span>
							<span className='stat-desc'> Suicides</span>
							<BarChart
								amount={
									(playerStats.suicides / greatestKOValue) *
									100
								}
							/>
						</p>
						<p>
							<span className='stat'>{playerStats.teamkos}</span>
							<span className='stat-desc'> Team KOs</span>
							<BarChart
								amount={
									(playerStats.teamkos / greatestKOValue) *
									100
								}
							/>
						</p>
					</div>
				</div>
				<div className='card damage-stats'>
					<h3>Damage</h3>
					<div>
						<p>
							<span className='stat stat-medium'>
								{playerStats.damageDealt}
							</span>
							<span className='stat-desc'> Damage Dealt</span>
							<BarChart
								amount={
									(playerStats.damageDealt /
										greatestDamageValue) *
									100
								}
							/>
						</p>
						<p>
							<span className='stat stat-medium'>
								{playerStats.damageTaken}
							</span>
							<span className='stat-desc'> Damage Taken</span>
							<BarChart
								amount={
									(playerStats.damageTaken /
										greatestDamageValue) *
									100
								}
							/>
						</p>
					</div>
				</div>
				<div className='misc-general-stats'>
					<MiscStat title='Avg. DPS' value='2.3dmg/s' />
					<MiscStat title='Avg. Game Length' value='80.8s' />
				</div>
			</div>
		</section>
	);
};

function MiscStat({ title, value }) {
	return (
		<p>
			<span>{title}</span>
			<span>{value}</span>
		</p>
	);
}

export default SectionOverallStats;
