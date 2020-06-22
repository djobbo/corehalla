import React, { FC } from 'react';
import { TopBar } from '../components/TopBar';
import { Sidebar } from '../components/TopBar/Sidebar';

interface Props {
    children: React.ReactNode;
}

export const Layout: FC<Props> = ({ children }: Props) => {
    return (
        <>
            <Sidebar />
            <TopBar />
            {children}
        </>
    );
};
