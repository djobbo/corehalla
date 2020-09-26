import React, { FC } from 'react';

import { App } from './App';
import { PlayerSearchProvider } from './providers/PlayerSearchProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { NavigationProvider } from './providers/NavigationProvider';

export const SharedApp: FC = () => (
    <ThemeProvider>
        <NavigationProvider>
            <PlayerSearchProvider>
                <App />
            </PlayerSearchProvider>
        </NavigationProvider>
    </ThemeProvider>
);
