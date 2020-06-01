import React from 'react';
import { Link } from 'react-router-dom';

import { IFavorite } from '../../../util/fetchFavorites';

import './styles.scss';

export const FavoriteCard: React.FC<{ fav: IFavorite }> = ({ fav }) => {
	return (
		<Link className='card favorite-card' to={fav.link}>
			<p className='name'>{fav.name}</p>
			<p className='id'>id: {fav.id}</p>
			<img src={fav.thumbURI} alt={fav.name} />
		</Link>
	);
};
