import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App';
import { FavoritesProvider } from './providers/FavoritesProvider';
import { PlayerSearchProvider } from './providers/PlayerSearchProvider';
import { ThemeProvider } from './providers/ThemeProvider';

render(
    <BrowserRouter>
        <ThemeProvider>
            <FavoritesProvider>
                <PlayerSearchProvider>
                    <App />
                </PlayerSearchProvider>
            </FavoritesProvider>
        </ThemeProvider>
    </BrowserRouter>,
    document.getElementById('root'),
);
