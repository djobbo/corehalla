import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { Router } from 'react-router-dom';
import { history } from './history';

import { PlayerSearchProvider } from './providers/PlayerSearchProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { FavoritesProvider } from './providers/FavoritesProvider';
import { SidebarProvider } from './providers/SidebarProvider';
import { NavigationProvider } from './providers/NavigationProvider';

const rootElement = document.getElementById('root');
ReactDOM.render(
    <Router history={history}>
        <ThemeProvider>
            <NavigationProvider>
                <SidebarProvider>
                    <FavoritesProvider>
                        <PlayerSearchProvider>
                            <App />
                        </PlayerSearchProvider>
                    </FavoritesProvider>
                </SidebarProvider>
            </NavigationProvider>
        </ThemeProvider>
    </Router>,
    rootElement,
);
