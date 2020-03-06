import React, { useState, useEffect } from 'react';
import './PlayerPage/styles.css';

import Icon from '@mdi/react';
import {
	mdiStar,
	mdiAccountStarOutline,
	mdiSortAscending,
	mdiSortDescending
} from '@mdi/js';

import Loader from '../../components/Loader';

import PlayerStatsGen from '../../mockups/PlayerStats.mock';
import PlayerStats from '../../mockups/PlayerStats.json';

export default ({ match }) => {
	const sections = ['teams', 'legends', 'weapons'];
	const hash = window.location.hash.substring(1);

	const [activePage, setActivePage] = useState(
		sections.includes(hash) ? hash : 'overview'
	);

	const [loading, setLoading] = useState(true);
	const [loadingFailed, setLoadingFailed] = useState(false);
	const [playerStats, setPlayerStats] = useState({});

	useEffect(() => {
		setTimeout(() => {
			// setPlayerStats(PlayerStatsGen());
			setPlayerStats(PlayerStats);
			setLoading(false);
		}, 250);
	}, []);

	const section = (() => {
		if (loading) return <></>;
		switch (activePage) {
			case 'teams':
				return <SectionRanked2v2 teams={playerStats.teams} />;
			case 'legends':
				return (
					<SectionLegends
						legends={playerStats.legends}
						weapons={playerStats.weapons}
					/>
				);
			case 'weapons':
				return <SectionWeapons weapons={playerStats.weapons} />;
			default:
				return (
					<>
						<SectionOverview
							season={playerStats.season}
							best_legend={
								[...playerStats.legends].sort(
									(a, b) => b.season.rating - a.season.rating
								)[0]
							}
						/>
						<SectionOverallStats playerStats={playerStats} />
					</>
				);
		}
	})();

	return (
		<div className='PlayerPage'>
			{loading ? (
				<Loader />
			) : (
				<>
					<Header
						activePage={activePage}
						setActivePage={setActivePage}
						playerStats={playerStats}
					/>
					<main>{section}</main>
				</>
			)}
		</div>
	);
};

//#region Header

function Header({ activePage, setActivePage, playerStats }) {
	return (
		<header>
			<div className='banner-img'>
				{/* <img
					src='https://images.unsplash.com/photo-1558980664-1db506751c6c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80'
					alt='Banner_img'
				/> */}
				<img
					src='https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80'
					alt='Banner_img'
				/>
			</div>
			<div className='header-info'>
				<div className='profile-picture'>
					<a className='add-to-fav-btn' href='/#'>
						<Icon
							path={mdiStar}
							title='Add to favorites'
							size={2}
						/>
					</a>
					{/* <img
						src='https://images.unsplash.com/photo-1582499520799-96218f9992d2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80'
						alt='Profile_img'
					/> */}
					<img
						src='https://images.unsplash.com/photo-1583169724482-1a7a82ddf87e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=80'
						alt='Profile_img'
					/>
				</div>
				<div className='main-info'>
					<h1>
						{playerStats.name}{' '}
						<a href='/#'>
							<Icon
								path={mdiAccountStarOutline}
								title='Add to favorites'
								size={1}
							/>
						</a>
					</h1>
					<p>
						Level {playerStats.level} ({playerStats.xp} xp)
					</p>
					<p>Time spent in game: 25h 31m 58s</p>
				</div>
			</div>

			<nav className='main-nav'>
				<ul>
					<li className={activePage === 'overview' ? 'active' : null}>
						<a
							href='#overview'
							onClick={e => setActivePage('overview')}
						>
							Overview
						</a>
					</li>
					<li className={activePage === 'teams' ? 'active' : null}>
						<a href='#teams' onClick={e => setActivePage('teams')}>
							Teams
						</a>
					</li>
					<li className={activePage === 'legends' ? 'active' : null}>
						<a
							href='#legends'
							onClick={e => setActivePage('legends')}
						>
							Legends
						</a>
					</li>
					<li className={activePage === 'weapons' ? 'active' : null}>
						<a
							href='#weapons'
							onClick={e => setActivePage('weapons')}
						>
							Weapons
						</a>
					</li>
				</ul>
			</nav>
		</header>
	);
}
//#endregion

//#region SectionOverview

function SectionOverview({ season, best_legend }) {
	return (
		<section className='section-overview'>
			<h2 className='section-title'>Season Overview</h2>
			<div className='ranked-overview-display'>
				<div className='ranked-overall'>
					<RankedStats
						tier={season.tier}
						rating={season.rating}
						peak_rating={season.peak_rating}
						games={season.games}
						wins={season.wins}
						losses={season.games - season.wins}
						winrate={((season.wins / season.games) * 100).toFixed(
							1
						)}
						region={season.region}
					/>
				</div>
				<img
					src={`/assets/images/ranked-banners/${season.tier}.png`}
					alt=''
					className='main-ranked-banner'
				/>
				<div className='ranked-best-legend'>
					<BestLegendRankedStats
						legend={best_legend.name}
						rating={best_legend.season.rating}
						peak_rating={best_legend.season.peak_rating}
						games={best_legend.season.games}
						wins={best_legend.season.wins}
						losses={
							best_legend.season.games - best_legend.season.wins
						}
						winrate={(
							(best_legend.season.wins /
								best_legend.season.games) *
							100
						).toFixed(1)}
					/>
				</div>
			</div>
		</section>
	);
}

function RankedStats({
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
		<div className='ranked-stats'>
			<p>
				<span className='stat-desc'>Tier </span>
				<span className='stat stat-large'>{tier}</span>
			</p>
			<p>
				<span className='stat-desc'>Elo </span>
				<span className='stat stat-medium'>{rating}</span>
			</p>
			<p>
				<span className='stat-desc'>Peak </span>
				<span className='stat'>{peak_rating}</span>
			</p>
			<hr />
			<p>
				<span className='stat'>{games}</span>
				<span className='stat-desc'> Games </span>
				<span className='stat'>
					({wins}W-{losses}L)
				</span>
			</p>
			<p>
				<span className='stat-desc'>Winrate </span>
				<span className='stat'>{winrate}%</span>
			</p>
			<hr />
			<img
				src={`/assets/images/icons/flags/${region.toUpperCase()}.png`}
				alt={`${region}_flag`}
				className='region-icon'
			/>
		</div>
	);
}

function BestLegendRankedStats({
	legend = 'Random',
	rating = '750',
	peak_rating = '750',
	games = 0,
	wins = 0,
	losses = 0,
	winrate = '0'
}) {
	return (
		<div className='ranked-stats'>
			<p>
				<span className='stat stat-large'>{legend}</span>
				<span className='stat-desc'> Best Legend</span>
			</p>
			<p>
				<span className='stat stat-medium'>{rating}</span>
				<span className='stat-desc'> Elo</span>
			</p>
			<p>
				<span className='stat'>{peak_rating}</span>
				<span className='stat-desc'> Peak</span>
			</p>
			<hr />
			<p>
				<span className='stat'>{games}</span>
				<span className='stat-desc'> Games </span>
				<span className='stat'>
					({wins}W-{losses}L)
				</span>
			</p>
			<p>
				<span className='stat'>{winrate}%</span>
				<span className='stat-desc'> Winrate</span>
			</p>
			<hr />
			<img
				src={`/assets/images/icons/legends/${legend}.png`}
				alt={`${legend}`}
				className='legend-icon'
			/>
		</div>
	);
}

//#endregion

//#region SectionOverallStats

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

//#endregion

//#region SectionRanked2v2

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

//#endregion

//#region SectionLegends

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

//#endregion

//#region SectionWeapons

function SectionWeapons({ weapons }) {
	const [sortBy, setSortBy] = useState('');
	const [sortOrder, setSortOrder] = useState(-1);
	return (
		<section>
			<h2 className='section-title'>Weapons</h2>
			<div className='filters-container'>
				<div>
					<label htmlFor='sortby-select'>Sort By</label>
					<select
						onChange={e => setSortBy(e.target.value)}
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
}

//#endregion

//#region Charts

function PieChart({
	width = '2rem',
	height = '2rem',
	amount = 0,
	bg = 'var(--bg)',
	fg = 'var(--accent)'
}) {
	return (
		<svg
			className='pie-chart'
			width={width}
			height={height}
			viewBox='0 0 20 20'
		>
			<circle r='10' cx='10' cy='10' fill={bg} />
			<circle
				r='5'
				cx='10'
				cy='10'
				fill='transparent'
				stroke={fg}
				strokeWidth='10'
				strokeDasharray={`calc(${amount} * 31.4 / 100) 31.4`}
				transform='rotate(-90) translate(-20)'
			/>
		</svg>
	);
}

function BarChart({
	width = '100%',
	height = '0.25rem',
	amount = 0,
	bg = 'var(--bg)',
	fg = 'var(--accent)'
}) {
	return (
		<svg
			className='bar-chart'
			width={width}
			height={height}
			viewBox='0 0 20 20'
			preserveAspectRatio='none'
		>
			<rect x='0' y='0' width='20' height='20' fill={bg} />
			<rect
				className='fill'
				x='0'
				y='0'
				width={(amount / 100) * 20}
				height='20'
				fill={fg}
			/>
		</svg>
	);
}

//#endregion

function formatTime(s) {
	let timeLeft = s;

	let h = Math.floor(timeLeft / 3600);
	timeLeft -= h * 3600;

	let m = Math.floor(timeLeft / 60);
	timeLeft -= m * 60;
	return `${h}h ${m}m ${timeLeft}s`;
}
