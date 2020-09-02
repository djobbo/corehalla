import React, { FC } from 'react';
import styled from 'styled-components';

import { StatDesc } from '../TextStyles';

interface Props {
    title: string;
    children: React.ReactNode;
}

const CardWrapper = styled.div`
    background-color: var(--bg-alt);
    border-radius: 0.25rem;
    padding: 1rem;
    margin: 1rem 0;
    border: 0.5px solid transparent;

    &:hover {
        border-color: var(--accent);
    }
`;

const CardContent = styled.div``;

export const Card: FC<Props> = ({ title, children }: Props) => {
    return (
        <CardWrapper>
            <StatDesc>{title}</StatDesc>
            <CardContent>{children}</CardContent>
        </CardWrapper>
    );
};
