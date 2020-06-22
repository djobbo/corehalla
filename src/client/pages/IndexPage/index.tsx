import React, { FC, useContext } from 'react';

import './styles.scss';

import { FavoritesContext } from '../../FavoritesProvider';

import { FavoriteCard } from './FavoriteCard';

export const IndexPage: FC = () => {
    const { favorites } = useContext(FavoritesContext);
    const playerFavs = favorites ? (
        <div className="favorites-container">
            {favorites.players.map((fav) => (
                <FavoriteCard fav={fav} key={fav.id} />
            ))}
        </div>
    ) : null;
    return (
        <main>
            <h1>COREHALLA</h1>
            <div>
                <h2>Starred Players</h2>
                {playerFavs}
            </div>
            <div>
                <h2>Starred Clans</h2>
                <div className="favorites-container"></div>
            </div>
        </main>
    );
};
