import React, { useState } from 'react';

import Icon from '@mdi/react';
import { mdiSortAscending, mdiSortDescending } from '@mdi/js';

import formatTime from '../../../../util/formatTime';

const SectionWeapons = ({ weapons }) => {
	const [sortBy, setSortBy] = useState('');
	const [sortOrder, setSortOrder] = useState(-1);
	return (
		<section>
			<h2 className='section-title'>Weapons</h2>
			<div className='filters-container'>
				<div>
					<label htmlFor='sortby-select'>Sort By</label>
					<select
						onChange={(e) => setSortBy(e.target.value)}
						name='sortby-select'
					>
						<option value=''>XP</option>
						<option value='timeheld'>Time Held</option>
						<option value='rating'>Rating</option>
						<option value='peak_rating'>Peak Rating</option>
					</select>
				</div>
				<div>
					<label htmlFor='sortby-select'>Order</label>
					{sortOrder === 1 ? (
						<button onClick={(e) => setSortOrder(-1)}>
							<Icon
								path={mdiSortDescending}
								title='Sort Ascending'
								size={1}
							/>
						</button>
					) : (
						<button onClick={(e) => setSortOrder(1)}>
							<Icon
								path={mdiSortAscending}
								title='Sort Descending'
								size={1}
							/>
						</button>
					)}
				</div>
			</div>
			{[...weapons]
				.sort((a, b) => {
					switch (sortBy) {
						case 'rating':
							return (
								sortOrder *
								(a.season.rating_acc - b.season.rating_acc)
							);
						case 'peak_rating':
							return (
								sortOrder *
								(a.season.peak_rating_acc -
									b.season.peak_rating_acc)
							);
						case 'timeheld':
							return sortOrder * (a.timeheld - b.timeheld);
						default:
							return sortOrder * (a.xp - b.xp);
						// TODO: Complete all sort cases
					}
				})
				.map((w, i) => (
					<div
						key={i + Math.random()}
						className='card'
						style={{ '--delay': `${0.05 * parseInt(i)}s` }}
					>
						<h3>
							<img
								src={`/assets/images/icons/weapons/${w.name}.png`}
								alt={`${w.name}`}
								className='legend-icon'
								width='32px'
								height='32px'
							/>
							{w.name}
						</h3>

						<p>
							{w.season.best_rating} Elo ({w.season.peak_rating}{' '}
							Peak)
						</p>
						<p>
							{(w.season.rating_acc / w.legends.length).toFixed(
								0
							)}{' '}
							Average Elo (
							{(
								w.season.peak_rating_acc / w.legends.length
							).toFixed(0)}{' '}
							Average Peak)
						</p>
						<p>
							Level {w.level} ({w.xp} xp)
						</p>
						<p>Time held: {formatTime(w.timeheld)}</p>
					</div>
				))}
		</section>
	);
};

export default SectionWeapons;
