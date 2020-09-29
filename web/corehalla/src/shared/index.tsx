import React, { FC } from 'react';

import { App } from './App';
import { FavoritesProvider } from './providers/FavoritesProvider';
import { PlayerSearchProvider } from './providers/PlayerSearchProvider';
import { ThemeProvider } from './providers/ThemeProvider';

export const SharedApp: FC = () => (
    <ThemeProvider>
        <FavoritesProvider>
            <PlayerSearchProvider>
                <App />
            </PlayerSearchProvider>
        </FavoritesProvider>
    </ThemeProvider>
);
