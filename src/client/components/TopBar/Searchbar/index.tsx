import React, { useContext } from 'react';

import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';

import { PlayerSearchContext } from '../../../PlayerSearchProvider';

export const Searchbar: React.FC = () => {
    const { playerSearch, setPlayerSearch } = useContext(PlayerSearchContext);

    return (
        <div className="searchbox">
            <i>
                <Icon path={mdiMagnify} title="Discord" size={1} />
            </i>
            <input
                type="text"
                placeholder="Search Player..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
            />
        </div>
    );
};
