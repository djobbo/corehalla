import React from 'react';

import './styles.scss';

import { fetchFavorites } from '../../util/fetchFavorites';

import FavoriteCard from './FavoriteCard';

const IndexPage: React.FC = () => {
	const favs = fetchFavorites();
	console.log('favs', favs);
	const playerFavs = favs ? (
		<div>
			{favs.players.map((fav) => (
				<FavoriteCard fav={fav} key={fav.id} />
			))}
		</div>
	) : null;
	return (
		<>
			<h1>COREHALLA</h1>
			<div>
				<h2>Starred Players</h2>
				<div className='favorites-container'>{playerFavs}</div>
			</div>
			<div>
				<h2>Starred Clans</h2>
				<div className='favorites-container'></div>
			</div>
		</>
	);
};

export default IndexPage;
