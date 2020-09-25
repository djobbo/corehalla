import React, { FC } from 'react';

import { App } from './App';
import { PlayerSearchProvider } from './providers/PlayerSearchProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { FavoritesProvider } from './providers/FavoritesProvider';
import { NavigationProvider } from './providers/NavigationProvider';

export const SharedApp: FC = () => (
    <ThemeProvider>
        <NavigationProvider>
            <FavoritesProvider>
                <PlayerSearchProvider>
                    <App />
                </PlayerSearchProvider>
            </FavoritesProvider>
        </NavigationProvider>
    </ThemeProvider>
);
