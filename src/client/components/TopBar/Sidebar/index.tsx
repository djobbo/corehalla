import React, { FC, useContext } from 'react';

import { FavoritesContext } from '../../../FavoritesProvider';

import './styles.scss';
import { Link } from 'react-router-dom';
import { Searchbar } from '../Searchbar';

export const Sidebar: FC = () => {
    const { favorites } = useContext(FavoritesContext);
    return (
        <div className="sidebar">
            <Searchbar />
            <div>
                <h2>Favorites</h2>
                {favorites.players.map((fav) => (
                    <div key={fav.id}>
                        <Link to={fav.link}>{fav.name}</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};
