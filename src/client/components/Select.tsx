import React from 'react';
import styled from 'styled-components';

interface IOption<T extends string> {
    name: string;
    value: T;
}

interface Props<T extends string> {
    options: IOption<T>[];
    action: (selected: T) => void;
    title: string;
}

const OptionsWrapper = styled.select`
    background-color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    text-transform: uppercase;
`;

const Wrapper = styled.div`
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Title = styled.span`
    color: var(--text);
    font-size: 0.75rem;
    text-transform: uppercase;
    margin: 0 0.125rem;
    margin-bottom: 0.5rem;
`;

export function Select<T extends string>({ options, action, title }: Props<T>): React.ReactElement {
    return (
        <Wrapper>
            <Title>{title}</Title>
            <OptionsWrapper
                onChange={(e) => {
                    action(e.target.value as T);
                }}
            >
                {options.map(({ name, value }) => (
                    <option key={name} value={value}>
                        {name}
                    </option>
                ))}
            </OptionsWrapper>
        </Wrapper>
    );
}
