import React, { FC } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface Props {
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

export const Page: FC<Props> = ({ children }: Props) => {
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

export const PageContentWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;
