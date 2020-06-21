import React, { useState, createContext, useEffect } from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';
import qs from 'qs';
import { useDebounce } from './hooks/useDebounce';
import { history } from './history';

interface Props {
    children: React.ReactNode;
}

interface IPlayerSearchContext {
    playerSearch: string;
    setPlayerSearch: (value: string) => void;
}

export const PlayerSearchContext = createContext<IPlayerSearchContext>(null);

export const PlayerSearchProvider: React.FC<Props> = ({ children }: Props) => {
    const { search } = useLocation();
    const match = useRouteMatch<{
        region: string;
        bracket: string;
        page: string;
    }>('/rankings/:bracket/:region/:page');

    const params = match ? match.params : { bracket: '1v1', region: 'all', page: '1' };

    const [playerSearch, setPlayerSearch] = useState((qs.parse(search.substring(1)).p as string) || '');
    const [debouncedPlayerSecarch] = useDebounce(playerSearch, 1000);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (debouncedPlayerSecarch !== null && !isInitialLoad) {
            console.log('search');
            history.push(
                `/rankings/${params.bracket || '1v1'}/${params.region || 'all'}/${
                    params.page || '1'
                }?p=${debouncedPlayerSecarch}`,
            );
        }
        setIsInitialLoad(false);
    }, [debouncedPlayerSecarch]);

    return (
        <PlayerSearchContext.Provider value={{ playerSearch, setPlayerSearch }}>
            {children}
        </PlayerSearchContext.Provider>
    );
};
