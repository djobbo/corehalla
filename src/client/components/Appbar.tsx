import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiArrowLeft, mdiMagnify } from '@mdi/js';
import styled from 'styled-components';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
    title: string;
}

const NavbarWrapper = styled.div`
    color: var(--text);
    padding: 1rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg);
    z-index: 101;
    position: relative;
    border-bottom: 1px solid var(--bg-alt);

    & > div {
        display: flex;
        align-items: center;
    }

    svg {
        fill: var(--text);
    }
`;

const NavbarTitle = styled.span`
    font-size: 1rem;
    margin-left: 1rem;
`;

export const Navbar: FC<NavbarProps> = ({ title }: NavbarProps) => {
    return (
        <NavbarWrapper>
            <div>
                <Icon path={mdiArrowLeft} size={1} />
                <NavbarTitle>{title}</NavbarTitle>
            </div>
            <Icon path={mdiMagnify} size={1} />
        </NavbarWrapper>
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
    background-color: var(--bg);
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
    background-color: var(--bg);
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
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
`;

export const AppBar: FC<Props> = ({ title, tabs, chips }: Props) => {
    const [hideOnScroll, setHideOnScroll] = useState(false);

    useScrollPosition(
        ({ prevPos, currPos }) => {
            const isShow = currPos.y > prevPos.y;
            if (isShow !== hideOnScroll) setHideOnScroll(isShow);
        },
        [hideOnScroll],
    );

    return (
        <AppBarWrapper>
            <Navbar title={title} />
            <AnimatePresence initial={false}>
                {!hideOnScroll && (
                    <motion.div
                        initial={{ opacity: 0, y: -80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -80 }}
                        transition={{ ease: 'linear', duration: 0.125 }}
                    >
                        {tabs && <TabsContainer tabs={tabs} />}
                        {chips && <ChipsContainer chips={chips} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </AppBarWrapper>
    );
};
