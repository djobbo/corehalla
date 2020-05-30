import React from 'react';

import './styles.scss';

import { fetchFavorites, IFavorite } from '../../util/fetchFavorites';

const FavItem: React.FC<{ fav: IFavorite }> = ({ fav }) => {
	return (
		<div>
			<a href={fav.link}>
				<h2>{fav.name}</h2>
				<img src={fav.thumbURI} alt={fav.name} />
			</a>
		</div>
	);
};

const IndexPage: React.FC = () => {
	const favs = fetchFavorites();
	console.log('favs', favs);
	const playerFavs = favs ? (
		<div>
			{favs.players.map((fav) => (
				<FavItem fav={fav} key={fav.id} />
			))}
		</div>
	) : null;
	return (
		<>
			<h1>COREHALLA</h1>
			<div>
				<h2>Starred Players</h2>
				{playerFavs}
			</div>
			<div>
				<h2>Starred Clans</h2>
			</div>
		</>
	);
};

export default IndexPage;
