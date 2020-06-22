import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { Router } from 'react-router-dom';
import { history } from './history';

import { PlayerSearchProvider } from './PlayerSearchProvider';
import { ThemeProvider } from './ThemeProvider';
import { FavoritesProvider } from './FavoritesProvider';
import { SidebarProvider } from './SidebarProvider';

const rootElement = document.getElementById('root');
ReactDOM.render(
    <Router history={history}>
        <ThemeProvider>
            <SidebarProvider>
                <FavoritesProvider>
                    <PlayerSearchProvider>
                        <App />
                    </PlayerSearchProvider>
                </FavoritesProvider>
            </SidebarProvider>
        </ThemeProvider>
    </Router>,
    rootElement,
);
