import React from 'react';
import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';

interface Props {
    children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }: Props) => {
    return (
        <>
            <TopBar />
            {children}
            <Footer />
        </>
    );
};
