import React, { createContext, useState, FC } from 'react';

type ThemeMode = 'light' | 'dark' | 'solarizedDark' | 'solarizedLight';
type ThemeProps = '--bg' | '--bg-1' | '--bg-2' | '--bg-3' | '--text' | '--accent';
type Theme = {
    [k in ThemeProps]: string;
};

export const ThemeContext = createContext<{
    themeMode: ThemeMode;
    setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
}>(null);

export const themeModes: { [k in ThemeMode]: Theme } = {
    dark: {
        '--bg': '#212121',
        '--bg-1': '#353435',
        '--bg-2': '#3F3D3F',
        '--bg-3': '#494849',
        '--text': '#fff',
        '--accent': '#47C3DE',
    },
    light: {
        '--bg': '#f1f1f1',
        '--bg-1': '#e0e0e0',
        '--bg-2': '#e0e0e0',
        '--bg-3': '#e0e0e0',
        '--text': '#0f0e0e',
        '--accent': '#3188df',
    },
    solarizedDark: {
        '--bg': '#002b36',
        '--bg-1': '#073642',
        '--bg-2': '#073642',
        '--bg-3': '#073642',
        '--text': '#eee8d5',
        '--accent': '#2aa198',
    },
    solarizedLight: {
        '--bg': '#fdf6e3',
        '--bg-1': '#eee8d5',
        '--bg-2': '#eee8d5',
        '--bg-3': '#eee8d5',
        '--text': '#073642',
        '--accent': '#2aa198',
    },
};

interface Props {
    children: React.ReactNode;
}

export const ThemeProvider: FC<Props> = ({ children }: Props) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

    return <ThemeContext.Provider value={{ themeMode, setThemeMode }}>{children}</ThemeContext.Provider>;
};
