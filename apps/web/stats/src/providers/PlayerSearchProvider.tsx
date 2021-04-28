import React, { useState, createContext, FC, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useDebounce } from '../hooks/useDebounce';

interface Props {
    children: ReactNode;
}

interface IPlayerSearchContext {
    playerSearch: string;
    setPlayerSearch: React.Dispatch<React.SetStateAction<string>>;
}

const PlayerSearchContext = createContext<IPlayerSearchContext>({
    playerSearch: '',
    setPlayerSearch: () => ({}),
});

export const usePlayerSearchContext = (): IPlayerSearchContext => useContext(PlayerSearchContext);

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
        playerSearch,
    );

    return (
        <PlayerSearchContext.Provider value={{ playerSearch, setPlayerSearch }}>
            {children}
        </PlayerSearchContext.Provider>
    );
};
