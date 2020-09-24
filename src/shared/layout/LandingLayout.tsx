// Library imports
import React, { FC, PropsWithChildren } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Components imports
import { BottomNavigationBar } from '../components/BottomNavigationBar';
import { Page } from '../components/Page';
import styled from 'styled-components';

interface ITab<T> {
    render: (activeChip: T) => React.ReactElement;
    displayName?: string;
    chips?: {
        chipName: T;
        displayName?: string;
    }[];
    defaultChip?: T;
    link?: string;
}

interface Props {}

const Wrapper = styled.div<{ backgroundURL?: string }>`
    &::before {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        content: '';
        object-fit: cover;
        object-position: center;

        ${({ backgroundURL }) =>
            backgroundURL &&
            `
            background-image: url('${backgroundURL}');
            opacity: 0.2;
            filter: blur(2px);
        `}
    }
`;

export const LandingLayout: FC<PropsWithChildren<Props>> = ({ children }: PropsWithChildren<Props>) => {
    return (
        <>
            <Wrapper backgroundURL="/assets/images/backgrounds/Ulgrim.png">
                <Page>
                    <AnimatePresence exitBeforeEnter initial>
                        <motion.div key="page" animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
                            <main>{children}</main>
                        </motion.div>
                    </AnimatePresence>
                </Page>
            </Wrapper>
            <BottomNavigationBar />
        </>
    );
};
