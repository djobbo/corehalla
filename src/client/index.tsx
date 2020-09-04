import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { Router } from 'react-router-dom';
import { history } from './history';

import { PlayerSearchProvider } from './PlayerSearchProvider';
import { ThemeProvider } from './ThemeProvider';
import { FavoritesProvider } from './FavoritesProvider';
import { SidebarProvider } from './SidebarProvider';
import { NavigationProvider } from './NavigationProvider';

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
