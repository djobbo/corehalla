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
    console.log(str);
    return JSON.parse(str) as LocalFavorites;
};

export const setFavorite = (type: FavoriteType, value: IFavorite): void => {
    const currentFavs = fetchFavorites();
    const favs = {
        ...currentFavs,
        [type]: [...currentFavs[type].filter((x) => x.id !== value.id), value],
    };
    localStorage.setItem('favStats', JSON.stringify(favs));
};
