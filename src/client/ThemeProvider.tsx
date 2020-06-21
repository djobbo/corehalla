import React, { createContext, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'solarizedDark' | 'solarizedLight';
type ThemeProps = '--bg' | '--bg-alt' | '--text' | '--accent';
type Theme = {
    [k in ThemeProps]: string;
};

export const ThemeContext = createContext<{ themeMode: ThemeMode; setThemeMode: (value: ThemeMode) => void }>(null);

export const themeModes: { [k in ThemeMode]: Theme } = {
    dark: {
        '--bg': '#0f0e0e',
        '--bg-alt': '#161414',
        '--text': '#fff',
        '--accent': '#3188df',
    },
    light: {
        '--bg': '#f1f1f1',
        '--bg-alt': '#e0e0e0',
        '--text': '#0f0e0e',
        '--accent': '#3188df',
    },
    solarizedDark: {
        '--bg': '#002b36',
        '--bg-alt': '#073642',
        '--text': '#eee8d5',
        '--accent': '#2aa198',
    },
    solarizedLight: {
        '--bg': '#fdf6e3',
        '--bg-alt': '#eee8d5',
        '--text': '#073642',
        '--accent': '#2aa198',
    },
};

interface Props {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<Props> = ({ children }: Props) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('solarizedDark');

    return <ThemeContext.Provider value={{ themeMode, setThemeMode }}>{children}</ThemeContext.Provider>;
};
