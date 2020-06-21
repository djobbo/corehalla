import { createContext } from 'react';

type ThemeType = 'light' | 'dark' | 'solarizedDark' | 'solarizedLight';
type ThemeProps = '--bg' | '--bg-alt' | '--text' | '--accent';
type Theme = {
    [k in ThemeProps]: string;
};

export const ThemeContext = createContext<ThemeType>('solarizedDark');

export const themes: { [k in ThemeType]: Theme } = {
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
