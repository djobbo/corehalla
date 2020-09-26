import React from 'react';
import ReactDOM from 'react-dom';
import { SharedApp } from '../shared';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { FavoritesProvider } from '../shared/providers/FavoritesProvider';
import { SSRProvider } from '../shared/providers/SSRProvider';

const history = createBrowserHistory();

const rootElement = document.getElementById('root');
ReactDOM.render(
    <Router history={history}>
        <SSRProvider>
            <FavoritesProvider>
                {/* TODO: Might cause a problem on the server, since provider is only on the client */}
                <SharedApp />
            </FavoritesProvider>
        </SSRProvider>
    </Router>,
    rootElement,
);
