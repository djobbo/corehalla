import React, { createContext, useState, FC, useEffect } from 'react';

interface Props {
    children: React.ReactNode;
}

export interface IFavorite {
    id: string;
    link: string;
    name: string;
    thumbURI: string;
}

export type FavoriteType = 'players' | 'clans';

export type LocalFavorites = {
    players?: IFavorite[];
    clans?: IFavorite[];
} | null;

export const fetchFavorites = (): LocalFavorites => {
    const str = localStorage.getItem('favStats') || '{"players": [], "clans": []}';
    return JSON.parse(str) as LocalFavorites;
};

export const FavoritesContext = createContext<{
    favorites: LocalFavorites;
    setFavorites: React.Dispatch<React.SetStateAction<LocalFavorites>>;
    addFavorite: (type: FavoriteType, value: IFavorite) => void;
    removeFavorite: (type: FavoriteType, value: IFavorite) => void;
}>(null);

export const FavoritesProvider: FC<Props> = ({ children }: Props) => {
    const [favorites, setFavorites] = useState<LocalFavorites>(fetchFavorites());

    const addFavorite = (type: FavoriteType, value: IFavorite): void => {
        setFavorites({ ...favorites, [type]: [...favorites[type].filter((x) => x.id !== value.id), value] });
    };

    const removeFavorite = (type: FavoriteType, value: IFavorite): void => {
        setFavorites({ ...favorites, [type]: favorites[type].filter((x) => x.id !== value.id) });
    };

    useEffect(() => {
        localStorage.setItem('favStats', JSON.stringify(favorites));
    }, [favorites]);

    return (
        <FavoritesContext.Provider value={{ favorites, setFavorites, addFavorite, removeFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
