import React, { createContext, useState, FC } from 'react';

export const SidebarContext = createContext<{
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>(null);

interface Props {
    children: React.ReactNode;
}

export const SidebarProvider: FC<Props> = ({ children }: Props) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>{children}</SidebarContext.Provider>;
};
