import React, { FC } from 'react';
import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';

interface Props {
    children: React.ReactNode;
}

export const Layout: FC<Props> = ({ children }: Props) => {
    return (
        <>
            <TopBar />
            {children}
            <Footer />
        </>
    );
};
