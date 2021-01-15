import { motion } from 'framer-motion';
// Library imports
import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
    title?: string;
    children: ReactNode;
}

const CardTitle = styled.span`
    color: var(--text-2);
    font-size: 0.75rem;
    text-transform: uppercase;
    margin: 0 0.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    border-radius: 0.125rem;
`;

const CardWrapper = styled(motion.div)`
    /* background-color: var(--bg-1); */
    padding: 1rem;
    border: 0.5px solid transparent;
    display: flex;
    flex-direction: column;
    transition: 0.1s ease-in all;
    /* border-color: var(--bg-2); */

    &::before {
        content: '';
        background-color: var(--bg-1);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 0.25rem;
        backdrop-filter: blur(8px);
    }

    &:hover {
        border-color: var(--accent);
        box-shadow: 0 0 2rem var(--bg);
    }
`;

const CardContent = styled.div``;

export const Card: FC<Props> = ({ title, children }: Props) => {
    return (
        <CardWrapper>
            {title && <CardTitle>{title}</CardTitle>}
            <CardContent>{children}</CardContent>
        </CardWrapper>
    );
};
