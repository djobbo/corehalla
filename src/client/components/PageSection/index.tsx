import React, { FC, useState } from 'react';
import styled from 'styled-components';
import Icon from '@mdi/react';
import { mdiUnfoldLessHorizontal, mdiUnfoldMoreHorizontal } from '@mdi/js';

interface Props {
    children: React.ReactNode;
    title: string;
    initFoldState?: boolean;
}

const SectionTitle = styled.p`
    color: var(--text);
    opacity: 0.72;
    display: flex;
    justify-content: space-between;
    cursor: pointer;

    svg {
        fill: var(--text);
        fill-opacity: 0.72;
        height: 0.75rem;
    }
`;

const PageSectionWrapper = styled.section`
    padding: 2rem 1rem;
`;

const PageSectionContent = styled.div`
    margin-top: 2rem;
`;

//TODO: Change foldState variable name

export const PageSection: FC<Props> = ({ children, title, initFoldState }: Props) => {
    const [foldState, setFoldState] = useState(initFoldState ?? false);
    return (
        <PageSectionWrapper>
            <SectionTitle onClick={() => setFoldState((oldState) => !oldState)}>
                {title}{' '}
                {foldState ? (
                    <Icon path={mdiUnfoldLessHorizontal} size={1} />
                ) : (
                    <Icon path={mdiUnfoldMoreHorizontal} size={1} />
                )}
            </SectionTitle>

            {foldState && <PageSectionContent>{children}</PageSectionContent>}
        </PageSectionWrapper>
    );
};

export const SectionSeparator = styled.hr`
    border-bottom: 1px solid var(--bg-alt);
`;
