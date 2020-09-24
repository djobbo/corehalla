import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '../shared/App';
import { BrowserRouter as Router } from 'react-router-dom';
import { history } from '../shared/src/history';

import { PlayerSearchProvider } from '../shared/providers/PlayerSearchProvider';
import { ThemeProvider } from '../shared/providers/ThemeProvider';
import { FavoritesProvider } from '../shared/providers/FavoritesProvider';
import { SidebarProvider } from '../shared/providers/SidebarProvider';
import { NavigationProvider } from '../shared/providers/NavigationProvider';

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
