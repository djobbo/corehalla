import React, { useState } from 'react';

import Icon from '@mdi/react';
import { mdiSortAscending, mdiSortDescending } from '@mdi/js';

import BarChart from '../../../components/BarChart';

function SectionRanked2v2({ teams }) {
	const [rankTierFilter, setRankTierFilter] = useState('');
	const [sortBy, setSortBy] = useState('');
	const [sortOrder, setSortOrder] = useState(-1);

	return (
		<section className='section-2v2'>
			<h2 className='section-title'>Ranked 2v2</h2>
			<div className='filters-container'>
				<div>
					<label htmlFor='filter-select'>Tier</label>
					<select
						onChange={e => setRankTierFilter(e.target.value)}
						name='filter-selector'
					>
						<option value=''>Any</option>
						<option value='Diamond'>Diamond</option>
						<option value='Platinum'>Platinum</option>
						<option value='Gold'>Gold</option>
						<option value='Silver'>Silver</option>
						<option value='Bronze'>Bronze</option>
						<option value='Tin'>Tin</option>
					</select>
				</div>
				<div>
					<label htmlFor='sortby-select'>Sort By</label>
					<select
						onChange={e => setSortBy(e.target.value)}
						name='sortby-select'
					>
						<option value=''>Rating</option>
						<option value='peak_rating'>Peak Rating</option>
						<option value='games'>Games</option>
						<option value='wins'>Wins</option>
						<option value='winrate'>Winrate</option>
					</select>
				</div>
				<div>
					<label htmlFor='sortby-select'>Order</label>
					{sortOrder === 1 ? (
						<button onClick={e => setSortOrder(-1)}>
							<Icon
								path={mdiSortDescending}
								title='Sort Ascending'
								size={1}
							/>
						</button>
					) : (
						<button onClick={e => setSortOrder(1)}>
							<Icon
								path={mdiSortAscending}
								title='Sort Descending'
								size={1}
							/>
						</button>
					)}
				</div>
			</div>
			<div className='ranked-teams'>
				{[
					...(rankTierFilter === ''
						? teams
						: teams.filter(
								l =>
									l.season.tier.split(' ')[0] ===
									rankTierFilter
						  ))
				]
					.sort((a, b) => {
						switch (sortBy) {
							case 'peak_rating':
								return (
									sortOrder *
									(a.season.peak_rating -
										b.season.peak_rating)
								);
							case 'games':
								return (
									sortOrder *
									(a.season.games - b.season.games)
								);
							case 'wins':
								return (
									sortOrder * (a.season.wins - b.season.wins)
								);
							case 'winrate':
								return (
									sortOrder *
									(a.season.wins / a.season.games -
										b.season.wins / b.season.games)
								);
							default:
								return (
									sortOrder *
									(a.season.rating - b.season.rating)
								);
							// TODO: Complete all sort cases
						}
					})
					.map(
						({ teammate_id, teammate_name, season, region }, i) => (
							<Ranked2v2Team
								key={teammate_id + Math.random()}
								id={i}
								name={teammate_name}
								region={region}
								rating={season.rating}
								peak_rating={season.peak_rating}
								tier={season.tier}
								games={season.games}
								wins={season.wins}
								losses={season.games - season.wins}
								winrate={(
									(season.wins / season.games) *
									100
								).toFixed(1)}
							/>
						)
					)}
			</div>
		</section>
	);
}

function Ranked2v2Team({
	name = '',
	id,
	tier = 'Tin 0',
	rating = '750',
	peak_rating = '750',
	games = 0,
	wins = 0,
	losses = 0,
	winrate = '0',
	region = 'N/A'
}) {
	return (
		<div
			className='card ranked-team'
			style={{ '--delay': `${0.05 * parseInt(id)}s` }}
		>
			<h3>
				<img
					src={`/assets/images/icons/flags/${region}.png`}
					alt={`${region}_icon`}
				/>
				{name}
			</h3>
			<div className='stats-container'>
				<img
					style={{ '--delay': `${0.05 * parseInt(id)}s` }}
					src={`/assets/images/icons/ranked/${tier}.png`}
					alt={`${tier}_icon`}
				/>
				<div>
					<p>
						<span>{rating} </span>
						<span>Rating</span>
					</p>
					<p>
						<span>{peak_rating} </span>
						<span>Peak</span>
					</p>
					<p>
						<span>{winrate}% </span>
						<span>Winrate</span>
					</p>
					<p>
						<span>{games} </span>
						<span>Games</span>
					</p>
				</div>
			</div>
			<BarChart amount={winrate} height='1rem' />
		</div>
	);
}

export default SectionRanked2v2;
