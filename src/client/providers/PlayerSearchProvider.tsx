import React, { useState, createContext, FC } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { history } from '../history';
import { RankedRegion } from 'corehalla.js';

interface Props {
    children: React.ReactNode;
}

interface IPlayerSearchContext {
    playerSearch: string;
    setPlayerSearch: React.Dispatch<React.SetStateAction<string>>;
}

export const PlayerSearchContext = createContext<IPlayerSearchContext>(null);

export const PlayerSearchProvider: FC<Props> = ({ children }: Props) => {
    const { bracket = '1v1', region = 'all', page = '1' } = useParams<{
        bracket: string;
        region: RankedRegion;
        page: string;
    }>();

    const [playerSearch, setPlayerSearch] = useState('');

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
