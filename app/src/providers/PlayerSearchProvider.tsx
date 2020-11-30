import React, { useState, createContext, FC } from 'react';
import { useParams, useHistory } from 'react-router-dom';
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
    const { bracket = '1v1', region = 'all', page = '1' } = useParams<{
        bracket: string;
        region: RankedRegion;
        page: string;
    }>();

    const [playerSearch, setPlayerSearch] = useState('');

    const history = useHistory();

    useDebounce(
        (debouncedSearch) => {
            history.push(`/rankings/${bracket || '1v1'}/${region || 'all'}/${page || '1'}?p=${debouncedSearch}`);
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
