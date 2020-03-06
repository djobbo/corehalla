import React from 'react';

import './SectionOverallStats/styles.css';

import BarChart from '../../../components/BarChart';
import PieChart from '../../../components/PieChart';

function SectionOverallStats({ playerStats }) {
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
								amount={(
									(playerStats.wins / playerStats.games) *
									100
								).toFixed(1)}
							/>
						</div>
					</div>
				</div>
				<div className='card kos-stats'>
					<h3>KOs</h3>
					<div>
						<p>
							<span className='stat'>1358</span>
							<span className='stat-desc'> KOs</span>
							<BarChart amount='25' />
						</p>
						<p>
							<span className='stat'>862</span>
							<span className='stat-desc'> Falls</span>
							<BarChart amount='80' />
						</p>
						<p>
							<span className='stat'>48</span>
							<span className='stat-desc'> Suicides</span>
							<BarChart amount='2' />
						</p>
						<p>
							<span className='stat'>16</span>
							<span className='stat-desc'> Team KOs</span>
							<BarChart amount='37' />
						</p>
					</div>
				</div>
				<div className='card damage-stats'>
					<h3>Damage</h3>
					<div>
						<p>
							<span className='stat stat-medium'>258766</span>
							<span className='stat-desc'> Damage Dealt</span>
							<BarChart amount='96' />
						</p>
						<p>
							<span className='stat stat-medium'>188571</span>
							<span className='stat-desc'> Damage Taken</span>
							<BarChart amount='89' />
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
}

function MiscStat({ title, value }) {
	return (
		<p>
			<span>{title}</span>
			<span>{value}</span>
		</p>
	);
}

export default SectionOverallStats;
