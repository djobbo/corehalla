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
        <motion.div
            initial="out"
            animate="in"
            exit="out"
            variants={pageTransition}
            transition={{ duration: 0.2 }}
            className="page"
        >
            {children}
        </motion.div>
    );
};

export const PageContentWrapper = styled.div<{ pTop?: string }>`
    max-width: 1200px;
    margin: 0 auto;

    ${({ pTop }): string => `
        padding-top: ${pTop || 0};
    `}
`;
