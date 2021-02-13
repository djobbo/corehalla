// Library imports
import React, { FC, PropsWithChildren } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Components imports
import { SideNav } from '../components/SideNav';
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

const Wrapper = styled.div<{ backgroundURL?: string }>``;

export const LandingLayout: FC<PropsWithChildren<Props>> = ({ children }: PropsWithChildren<Props>) => {
    return (
        <>
            <Wrapper backgroundURL="/images/backgrounds/Ulgrim.png">
                <Page>
                    <AnimatePresence exitBeforeEnter initial>
                        <motion.div key="page" animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
                            <main>{children}</main>
                        </motion.div>
                    </AnimatePresence>
                </Page>
            </Wrapper>
            <SideNav />
        </>
    );
};
