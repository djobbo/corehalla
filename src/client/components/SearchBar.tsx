// Library imports
import React, { FC, useContext } from 'react';
import styled from 'styled-components';

// Context imports
import { PlayerSearchContext } from '../providers/PlayerSearchProvider';

const Wrapper = styled.div``;

export const SearchBar: FC = () => {
    const { setPlayerSearch } = useContext(PlayerSearchContext);

    return (
        <Wrapper>
            <input
                type="text"
                onChange={(e) => {
                    setPlayerSearch(e.target.value);
                }}
            />
        </Wrapper>
    );
};
