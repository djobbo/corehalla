// Library imports
import React, { FC, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface Props {
    title?: string;
    children: React.ReactNode;
}

const pageTransition = {
    in: {
        opacity: 1,
    },
    out: {
        opacity: 0,
    },
};

export const Page: FC<Props> = ({ children, title }: Props) => {
    useEffect(() => {
        if (!title) return;
        document.title = title;
    }, []);

    return (
        <PageContentWrapper
            initial="out"
            animate="in"
            exit="out"
            variants={pageTransition}
            transition={{ duration: 0.2 }}
        >
            <div>{children}</div>
        </PageContentWrapper>
    );
};

const PageContentWrapper = styled(motion.div)`
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    & > div {
        margin: 0 auto;
        max-width: 1200px;
        width: 100%;
    }
`;
