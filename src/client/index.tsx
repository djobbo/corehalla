import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { Router } from 'react-router-dom';
import { history } from './history';

import { PlayerSearchProvider } from './PlayerSearchProvider';

const rootElement = document.getElementById('root');
ReactDOM.render(
    <Router history={history}>
        <PlayerSearchProvider>
            <App />
        </PlayerSearchProvider>
    </Router>,
    rootElement,
);
