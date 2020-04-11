import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import qs from 'qs';

import './styles.scss';

import Rankings from '../../mockups/Rankings.json';

import Loader from '../../components/Loader';

function RankingsPage({ match: { params }, location: { search } }) {
	const [loading, setLoading] = useState(true);
	const [rankings, setRankings] = useState({});
	const [region, setRegion] = useState(params.region || 'all');
	const [bracket, setBracket] = useState(params.bracket || '1v1');
	const [page, setPage] = useState(params.page || 1);
	const [player, setPlayer] = useState(qs.parse(search.substring(1)).p || '');

	const regions = ['US-E', 'EU', 'BRZ', 'AUS', 'US-W', 'SEA', 'JPN'];

	useEffect(() => {
		setLoading(true);
		setTimeout(() => {
			setRankings(Rankings);
			setLoading(false);
		}, 250);
	}, [bracket, region, page, player]);

	return (
		<div className='RankingsPage'>
			{loading ? (
				<Loader />
			) : (
				<main>
					<div className='filters-container'>
						<div>
							<label htmlFor='filter-select'>Region</label>
							<select
								onChange={(e) => setRegion(e.target.value)}
								name='filter-selector'
							>
								<option value=''>Any</option>
								{regions.map((r, i) => (
									<option key={i} value={r}>
										{r}
									</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor='filter-select'>Bracket</label>
							<select
								onChange={(e) => setBracket(e.target.value)}
								name='filter-selector'
							>
								<option value=''>1v1</option>
								<option value='2v2'>2v2</option>
								{/* <option value='Power'>Power</option> */}
							</select>
						</div>
					</div>
					<div className='rankings-container'>
						{rankings.map((p, i) => (
							<RankingsItem
								key={p.brawlhalla_id + Math.random()}
								player={p}
								i={i}
							/>
						))}
					</div>
				</main>
			)}
		</div>
	);
}

function RankingsItem({ player, i }) {
	return (
		<div
			className='card rankings-item'
			style={{ '--delay': `${0.015 * parseInt(i)}s` }}
		>
			<p className='stat stat-medium rank'>{player.rank}. </p>
			<p>{player.region}</p>
			<p className='stat name'>
				<Link to={`/stats/player/${player.brawlhalla_id}`}>
					{player.name}
				</Link>{' '}
				<span className='stat-desc'>(id: {player.brawlhalla_id})</span>
			</p>
			<p>{player.tier}</p>
			<p>
				{player.games} ({player.wins}W - {player.games - player.wins}L)
			</p>
			<p>{((player.wins / player.games) * 100).toFixed(1)}%</p>
			<p>{player.rating}</p>
			<p>{player.peak_rating}</p>
		</div>
	);
}

export default RankingsPage;
