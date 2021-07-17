import { defaultTheme } from './default';
import { solarizedDarkTheme } from './solarizedDark';
import { earthsongTheme } from './earthsong';

export interface Theme {
    'bg-dark': string;
    'bg-dark-var1': string;
    'bg-dark-var2': string;
    'on-bg-dark': string;
    'on-bg-dark-var1': string;
    accent: string;
    secondary: string;
}

export const themes = {
    default: defaultTheme,
    solarizedDark: solarizedDarkTheme,
    earthsong: earthsongTheme,
};

export type ThemeName = keyof typeof themes;

export const themeNames: ThemeName[] = Object.keys(themes) as ThemeName[];
