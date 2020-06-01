import React from 'react';

import { IFavorite } from '../../../util/fetchFavorites';

import './styles.scss';

const FavoriteCard: React.FC<{ fav: IFavorite }> = ({ fav }) => {
	return (
		<a className='card favorite-card' href={fav.link}>
			<p className='name'>{fav.name}</p>
			<p className='id'>id: {fav.id}</p>
			<img src={fav.thumbURI} alt={fav.name} />
		</a>
	);
};

export default FavoriteCard;
