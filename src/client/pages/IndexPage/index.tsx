// Library imports
import React, { FC } from 'react';

// Components imports
import { Page } from '../../components/Page';
import { Link } from 'react-router-dom';

export const IndexPage: FC = () => {
    return (
        <Page>
            index<Link to="/stats/player/4281946">Player Page</Link>
        </Page>
    );
};
