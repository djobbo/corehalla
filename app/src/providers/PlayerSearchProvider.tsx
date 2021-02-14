import React, { useState, createContext, FC } from 'react';
import { useRouter } from 'next/router';
import { useDebounce } from '../hooks/useDebounce';
import type { RankedRegion } from 'corehalla';

interface Props {
	children: React.ReactNode;
}

interface IPlayerSearchContext {
	playerSearch: string;
	setPlayerSearch: React.Dispatch<React.SetStateAction<string>>;
}

export const PlayerSearchContext = createContext<IPlayerSearchContext>({
	playerSearch: '',
	setPlayerSearch: () => {},
});

export const PlayerSearchProvider: FC<Props> = ({ children }: Props) => {
	const router = useRouter();
	const { bracket = '1v1', region = 'all', page = '1' } = router.query;

	const [playerSearch, setPlayerSearch] = useState('');

	useDebounce(
		(debouncedSearch) => {
			router.push({
				pathname: `/rankings/${bracket}/${region}/${page}`,
				search: `?p=${debouncedSearch}`,
			});
		},
		1000,
		playerSearch
	);

	return (
		<PlayerSearchContext.Provider value={{ playerSearch, setPlayerSearch }}>
			{children}
		</PlayerSearchContext.Provider>
	);
};
