import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiArrowLeft, mdiMagnify } from '@mdi/js';
import styled from 'styled-components';
import { useScrollPosition } from '../../hooks/useScrollPosition';

interface NavbarProps {
    title: string;
}

export const Navbar: FC<NavbarProps> = ({ title }: NavbarProps) => {
    return (
        <div>
            <Icon path={mdiArrowLeft} size={1} /> {title} <Icon path={mdiMagnify} size={1} />
        </div>
    );
};

interface ITab {
    title: string;
    link: string;
    active?: boolean;
}

interface TabsProps {
    tabs: ITab[];
}

const Tab = styled.div<{ active?: boolean }>`
    white-space: nowrap;
    font-size: 0.75rem;
    text-transform: uppercase;
    a {
        padding: 1rem 1.5rem;
        color: var(--text);
        opacity: 0.48;
        display: block;
    }

    ${({ active }) =>
        active &&
        `
        a {
            opacity: 1;
            color: var(--accent);
            border-bottom:1px solid var(--accent);
        }
    `}
`;

const TabsContainerWrapper = styled.div`
    display: flex;
    overflow-x: auto;
    border-bottom: 1px solid var(--bg-alt);
`;

export const TabsContainer: FC<TabsProps> = ({ tabs }: TabsProps) => {
    return (
        <TabsContainerWrapper>
            {tabs.map(({ title, link, active }, i) => (
                <Tab key={i} active={active}>
                    <Link to={link}>{title}</Link>
                </Tab>
            ))}
        </TabsContainerWrapper>
    );
};

interface IChip {
    title: string;
    link: string;
    active?: boolean;
}

interface ChipsContainerProps {
    chips: IChip[];
}

const Chip = styled.div<{ active?: boolean }>`
    white-space: nowrap;
    margin: 0 0.5rem;
    border-radius: 2rem;
    border: 1px solid var(--text);
    background-color: var(--bg-alt);
    a {
        padding: 0.25rem 1rem;
        display: block;
        color: var(--text);
    }

    ${({ active }) =>
        active &&
        `
        background-color: var(--text);
        a {
            color: var(--bg);
        }
    `}
`;

const ChipsContainerWrapper = styled.div`
    font-size: 1rem;
    display: flex;
    overflow-x: auto;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid var(--bg-alt);
`;

export const ChipsContainer: FC<ChipsContainerProps> = ({ chips }: ChipsContainerProps) => {
    return (
        <ChipsContainerWrapper>
            {chips.map(({ title, link, active }, i) => (
                <Chip key={i} active={active}>
                    <Link to={link}>{title}</Link>
                </Chip>
            ))}
        </ChipsContainerWrapper>
    );
};

interface Props {
    title: string;
    tabs?: ITab[];
    chips?: IChip[];
}

const AppBarWrapper = styled.div`
    background-color: var(--bg);
    position: sticky;
    top: 0;
    z-index: 100;
`;

export const AppBar: FC<Props> = ({ title, tabs, chips }: Props) => {
    const [hideOnScroll, setHideOnScroll] = useState(true);

    useScrollPosition(
        ({ prevPos, currPos }) => {
            const isShow = currPos.y > prevPos.y;
            if (isShow !== hideOnScroll) setHideOnScroll(isShow);
        },
        [hideOnScroll],
        100,
    );

    return (
        <AppBarWrapper>
            <Navbar title={title} />
            {!hideOnScroll && (
                <>
                    {tabs && <TabsContainer tabs={tabs} />}
                    {chips && <ChipsContainer chips={chips} />}
                </>
            )}
        </AppBarWrapper>
    );
};
