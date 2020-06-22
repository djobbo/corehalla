import React, { FC } from 'react';
import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';
import { Sidebar } from '../components/TopBar/Sidebar';

interface Props {
    children: React.ReactNode;
}

export const Layout: FC<Props> = ({ children }: Props) => {
    return (
        <>
            <TopBar />
            <Sidebar />
            <div className="content">
                {children}
                <Footer />
            </div>
        </>
    );
};
