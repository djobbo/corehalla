import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    children: React.ReactNode;
}

const pageTransition = {
    in: {
        opacity: 1,
        y: 0,
    },
    out: {
        opacity: 0,
        y: '-100vh',
    },
};

export const Page: React.FC<Props> = ({ children }: Props) => {
    return (
        <motion.div initial="out" animate="in" exit="out" variants={pageTransition} className="page">
            {children}
        </motion.div>
    );
};
