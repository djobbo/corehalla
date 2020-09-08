import React, { FC } from 'react';
import styled from 'styled-components';

interface Props {
    title?: string;
    children: React.ReactNode;
}

const CardTitle = styled.span`
    color: var(--text);
    font-size: 0.75rem;
    text-transform: uppercase;
    opacity: 0.48;
    margin: 0 0.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    display: block;
`;

const CardWrapper = styled.div`
    background-color: var(--bg-alt);
    border-radius: 0.25rem;
    padding: 1rem;
    border: 0.5px solid transparent;

    &:hover {
        border-color: var(--accent);
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
