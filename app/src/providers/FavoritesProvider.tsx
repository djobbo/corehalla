import { createContext, useState, FC, useEffect } from 'react';

interface Props {
	children: React.ReactNode;
}

export type ProfileType = 'player' | 'clan'; // TODO: Put this somewhere else

export interface IFavorite {
	id: string;
	name: string;
	thumbURI: string;
	type: ProfileType;
}

const getLocalStorage = () => {
	return typeof window !== 'undefined' ? localStorage : undefined;
};

const fetchFavorites = (): IFavorite[] => {
	const str = getLocalStorage()?.getItem('favoritesStats') || '[]';
	return JSON.parse(str);
};

export const FavoritesContext = createContext<{
	favorites: IFavorite[];
	isFavorite: (value: IFavorite) => boolean;
	addFavorite: (value: IFavorite) => void;
	removeFavorite: (value: IFavorite) => void;
	updatedAt: number;
}>({
	favorites: [],
	isFavorite: () => false,
	addFavorite: () => {},
	removeFavorite: () => {},
	updatedAt: -1,
});

export const FavoritesProvider: FC<Props> = ({ children }: Props) => {
	const [favorites, setFavorites] = useState<IFavorite[]>(fetchFavorites());
	const [updatedAt, setUpdatedAt] = useState(Date.now());

	const isFavorite = (newFav: IFavorite): boolean => {
		const localFavorites = fetchFavorites();
		const index = localFavorites.findIndex(
			(x) => x.type === newFav.type && x.id === newFav.id
		);
		return index > -1;
	};

	const addFavorite = (newFav: IFavorite): void => {
		const localFavorites = fetchFavorites();
		const index = localFavorites.findIndex(
			(x) => x.type === newFav.type && x.id === newFav.id
		);
		if (index < 0) setFavorites([...localFavorites, newFav]);
		else {
			localFavorites[index] = newFav;
			setFavorites(localFavorites);
		}
	};

	const removeFavorite = (favToBeRemoved: IFavorite): void => {
		const localFavorites = fetchFavorites();
		setFavorites(
			localFavorites.filter(
				(x) =>
					!(
						x.type === favToBeRemoved.type &&
						x.id === favToBeRemoved.id
					)
			)
		);
	};

	useEffect(() => {
		localStorage.setItem('favoritesStats', JSON.stringify(favorites));
		setUpdatedAt(Date.now());
	}, [favorites]);

	return (
		<FavoritesContext.Provider
			value={{
				favorites,
				addFavorite,
				removeFavorite,
				isFavorite,
				updatedAt,
			}}
		>
			{children}
		</FavoritesContext.Provider>
	);
};
