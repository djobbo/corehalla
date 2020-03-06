import React, { useState } from 'react';

import Icon from '@mdi/react';
import { mdiSortAscending, mdiSortDescending } from '@mdi/js';

function SectionLegends({ legends, weapons }) {
	const [weaponFilter, setWeaponFilter] = useState('');
	const [sortBy, setSortBy] = useState('');
	const [sortOrder, setSortOrder] = useState(-1);

	return (
		<section className='section-legends'>
			<h2 className='section-title'>Legends</h2>
			<div className='filters-container'>
				<div>
					<label htmlFor='filter-select'>Weapon</label>
					<select
						onChange={e => setWeaponFilter(e.target.value)}
						name='filter-selector'
					>
						<option value=''>Any</option>
						{weapons.map((w, i) => (
							<option key={i} value={w.name}>
								{w.name}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor='sortby-select'>Sort By</label>
					<select
						onChange={e => setSortBy(e.target.value)}
						name='sortby-select'
					>
						<option value=''>Level / XP</option>
						<option value='matchtime'>Time Played</option>
						<option value='rating'>Rating</option>
						<option value='peak_rating'>Peak Rating</option>
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
			{[
				...(weaponFilter === ''
					? legends
					: legends.filter(l =>
							[l.weapon_one, l.weapon_two].includes(weaponFilter)
					  ))
			]
				.sort((a, b) => {
					switch (sortBy) {
						case 'rating':
							return (
								sortOrder * (a.season.rating - b.season.rating)
							);
						case 'peak_rating':
							return (
								sortOrder *
								(a.season.peak_rating - b.season.peak_rating)
							);
						case 'matchtime':
							return sortOrder * (a.matchtime - b.matchtime);
						default:
							return sortOrder * (a.xp - b.xp);
						// TODO: Complete all sort cases
					}
				})
				.map((l, i) => (
					<div
						key={i + Math.random()}
						className='card'
						style={{ '--delay': `${0.025 * parseInt(i)}s` }}
					>
						<img
							src={`/assets/images/icons/legends/${l.name}.png`}
							alt={`${l.name}`}
							className='legend-icon'
							width='32px'
							height='32px'
						/>
						{i + 1}. {l.name} - {l.season.rating} Elo (
						{l.season.peak_rating} Peak) - Level {l.level} ({l.xp}{' '}
						xp)
					</div>
				))}
		</section>
	);
}

export default SectionLegends;
