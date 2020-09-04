import React, { createContext, useState, FC } from 'react';

export type NavigationPage = 'Home' | 'Rankings' | 'Favorites' | 'History' | 'Settings';

export const NavigationContext = createContext<{
    activePage: NavigationPage;
    setActivePage: React.Dispatch<React.SetStateAction<string>>;
}>(null);

interface Props {
    children: React.ReactNode;
}

export const NavigationProvider: FC<Props> = ({ children }: Props) => {
    const [activePage, setActivePage] = useState<NavigationPage>('Home');

    return <NavigationContext.Provider value={{ activePage, setActivePage }}>{children}</NavigationContext.Provider>;
};
