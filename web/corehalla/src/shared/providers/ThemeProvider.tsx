import React, { createContext, useState, FC } from 'react';
import { CSSProperties } from 'styled-components';

type ThemeMode = 'light' | 'dark' | 'solarizedDark' | 'solarizedLight';
type ThemeProps = 'bg' | 'bg-1' | 'bg-2' | 'text-2' | 'text' | 'accent';
export type Theme = {
    [k in ThemeProps]: string;
};

export const ThemeContext = createContext<{
    getTheme: () => Theme;
    getThemeStr: () => string;
    setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
}>(null);

export const themeModes: { [k in ThemeMode]: Theme } = {
    dark: {
        bg: '#212121',
        'bg-1': '#282828',
        'bg-2': '#373737',
        'text-2': '#ABABAB',
        text: '#F1F1F1',
        accent: '#FF732F',
    },
    light: {
        bg: '#F1F1F1',
        'bg-1': '#cccccc',
        'bg-2': '#ABABAB',
        'text-2': '#373737',
        text: '#212121',
        accent: '#FF732F',
    },
    solarizedDark: {
        bg: '#002b36',
        'bg-1': '#073642',
        'bg-2': '#073642',
        'text-2': '#073642',
        text: '#eee8d5',
        accent: '#2aa198',
    },
    solarizedLight: {
        bg: '#fdf6e3',
        'bg-1': '#eee8d5',
        'bg-2': '#eee8d5',
        'text-2': '#eee8d5',
        text: '#073642',
        accent: '#2aa198',
    },
};

interface Props {
    children: React.ReactNode;
}

export const ThemeProvider: FC<Props> = ({ children }: Props) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

    const getTheme = () => themeModes[themeMode];
    const getThemeStr = () =>
        Object.entries(themeModes[themeMode]).reduce<string>((acc, [key, value]) => `${acc} --${key}: ${value};`, '');

    return <ThemeContext.Provider value={{ getTheme, getThemeStr, setThemeMode }}>{children}</ThemeContext.Provider>;
};
