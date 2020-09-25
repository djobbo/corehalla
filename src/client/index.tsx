import React from 'react';
import ReactDOM from 'react-dom';
import { SharedApp } from '../shared';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { FavoritesProvider } from '../shared/providers/FavoritesProvider';

const history = createBrowserHistory();

const rootElement = document.getElementById('root');
ReactDOM.render(
    <Router history={history}>
        <FavoritesProvider>
            <SharedApp />
        </FavoritesProvider>
    </Router>,
    rootElement,
);
