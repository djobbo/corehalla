import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '../shared/App';
import { Router } from 'react-router-dom';
import { history } from '../shared/history';

import { PlayerSearchProvider } from '../shared/providers/PlayerSearchProvider';
import { ThemeProvider } from '../shared/providers/ThemeProvider';
import { FavoritesProvider } from '../shared/providers/FavoritesProvider';
import { NavigationProvider } from '../shared/providers/NavigationProvider';

const rootElement = document.getElementById('root');
ReactDOM.render(
    <Router history={history}>
        <ThemeProvider>
            <NavigationProvider>
                <FavoritesProvider>
                    <PlayerSearchProvider>
                        <App />
                    </PlayerSearchProvider>
                </FavoritesProvider>
            </NavigationProvider>
        </ThemeProvider>
    </Router>,
    rootElement,
);
