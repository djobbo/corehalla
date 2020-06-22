import React, { FC, useContext } from 'react';

import { FavoritesContext } from '../../../FavoritesProvider';
import { SidebarContext } from '../../../SidebarProvider';

import './styles.scss';
import { Link } from 'react-router-dom';
import { Searchbar } from '../Searchbar';

export const Sidebar: FC = () => {
    const { sidebarOpen } = useContext(SidebarContext);
    const { favorites } = useContext(FavoritesContext);
    return (
        sidebarOpen && (
            <div className="sidebar">
                <div className="logo">
                    <Link to="/">
                        <img src="/assets/images/logo.png" alt="Logo" height="16px" />
                    </Link>
                </div>
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
        )
    );
};
