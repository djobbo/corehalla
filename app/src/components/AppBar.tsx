// Library imports
import React, { FC, useState, ReactElement } from 'react';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { motion, Variants } from 'framer-motion';
import { GoBackIcon, SearchIcon } from './Icons';

// Custom Hooks imports
import { useScrollPosition } from '../hooks/useScrollPosition';

// Components imports
import { SearchBar } from './SearchBar';

interface NavbarProps {
    title?: string;
}

const NavbarWrapper = styled.div<{ showSearch?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 101;
    position: relative;
    border-bottom: 1px solid var(--bg-1);
    height: 2rem;

    & > div {
        display: flex;
        align-items: center;
    }

    ${({ showSearch }) => `
    padding: ${showSearch ? '0 1rem 0 0' : '1rem'};
        background-color: var(${showSearch ? '--text' : '--bg'});
        color: var(${showSearch ? '--bg' : '--text'});
    `}
`;

const NavbarTitle = styled.span`
    font-size: 1rem;
    margin-left: 1rem;
`;

const NavbarTitleLogo = styled.img`
    height: 1.5rem;
`;

export const Navbar: FC<NavbarProps> = ({ title }: NavbarProps) => {
    const [showSearch, setShowSearch] = useState(false);
    const history = useHistory();

    return (
        <NavbarWrapper showSearch={showSearch}>
            {showSearch ? (
                <SearchBar setShowSearch={setShowSearch} />
            ) : (
                <>
                    {title ? (
                        <div>
                            <Link
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    history.goBack();
                                }}
                            >
                                {GoBackIcon}
                            </Link>
                            <NavbarTitle>{title}</NavbarTitle>
                        </div>
                    ) : (
                        <Link to="/">
                            <NavbarTitleLogo src="/images/logo.png" alt="corehalla logo" />
                        </Link>
                    )}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setShowSearch(true);
                        }}
                    >
                        {SearchIcon}
                    </a>
                </>
            )}
        </NavbarWrapper>
    );
};

interface ITab<T extends string> {
    displayName: T;
    link: string;
    active?: boolean;
}

interface TabsProps<T extends string> {
    tabs: ITab<T>[];
}

const Tab = styled.div<{ active?: boolean }>`
    white-space: nowrap;
    font-size: 0.75rem;
    text-transform: uppercase;
    a {
        height: 100%;
        color: var(--text-2);
        display: flex;
        align-items: center;
        padding: 0 1.5rem;
    }

    ${({ active }) =>
        active &&
        `
        a {
            color: var(--accent);
            border-bottom:1px solid var(--accent);
        }
    `}
`;

const TabsContainerWrapper = styled.div`
    display: flex;
    overflow-x: auto;
    border-bottom: 1px solid var(--bg-1);
    background-color: var(--bg);
    height: 3rem;
`;

export function TabsContainer<T extends string>({ tabs }: TabsProps<T>): ReactElement<TabsProps<T>> {
    const history = useHistory();

    return (
        <TabsContainerWrapper>
            {tabs.map(({ displayName, link, active }, i) => (
                <Tab key={i} active={active}>
                    <Link to={({ pathname }) => `${pathname}${link}`} replace>
                        {displayName}
                    </Link>
                </Tab>
            ))}
        </TabsContainerWrapper>
    );
}

interface IChip<T extends string> {
    displayName: T;
    action?: () => void;
    active?: boolean;
}

interface ChipsContainerProps<T extends string> {
    chips: IChip<T>[];
}

const Chip = styled.div<{ active?: boolean }>`
    white-space: nowrap;
    margin: 0 0.5rem;
    border-radius: 2rem;
    border: 1px solid var(--bg-2);
    background-color: var(--bg-1);
    a {
        padding: 0.25rem 1rem;
        display: block;
        color: var(--text);
    }

    ${({ active }) =>
        active &&
        `
        background-color: var(--accent);
        border-color: var(--accent);
        a {
            color: var(--bg);
        }
    `}
`;

const ChipsContainerWrapper = styled.div`
    font-size: 1rem;
    display: flex;
    align-items: center;
    overflow-x: auto;
    border-bottom: 1px solid var(--bg-1);
    background-color: var(--bg);
    height: 3rem;
`;

export function ChipsContainer<T extends string>({
    chips,
}: ChipsContainerProps<T>): ReactElement<ChipsContainerProps<T>> {
    return (
        <ChipsContainerWrapper>
            {chips.map(({ displayName, action, active }, i) => (
                <Chip key={i} active={active}>
                    <Link
                        to="#"
                        onClick={
                            action
                                ? (e) => {
                                      e.preventDefault();
                                      action();
                                  }
                                : null
                        }
                    >
                        {displayName}
                    </Link>
                </Chip>
            ))}
        </ChipsContainerWrapper>
    );
}

export interface AppBarProps<T extends string, U extends string> {
    title?: string;
    tabs?: ITab<T>[];
    chips?: IChip<U>[];
}

const AppBarWrapper = styled.div`
    position: sticky;
    top: 0;
    z-index: 10;
`;

const ExtrasContainer = styled.div`
    position: sticky;
    top: 2rem;
    left: 0;
    right: 0;
    height: auto;
    z-index: 9;
`;

const extrasContainerVariants: Variants = {
    in: {
        opacity: 1,
        y: 0,
        transition: { ease: 'linear', duration: 0.125 },
    },
    out: {
        opacity: 0,
        y: -80,
    },
};

export function AppBar<T extends string, U extends string>({
    title,
    tabs,
    chips,
}: AppBarProps<T, U>): ReactElement<AppBarProps<T, U>> {
    const [hideOnScroll, setHideOnScroll] = useState(false);

    useScrollPosition(
        ({ currScrollPos, prevScrollPos }) => {
            const isShow = currScrollPos > prevScrollPos;
            if (isShow !== hideOnScroll) setHideOnScroll(isShow);
        },
        [hideOnScroll],
    );

    return (
        <>
            <AppBarWrapper>
                <Navbar title={title} />
            </AppBarWrapper>
            <ExtrasContainer>
                <motion.div animate={hideOnScroll ? 'out' : 'in'} variants={extrasContainerVariants}>
                    {tabs && <TabsContainer tabs={tabs} />}
                    {chips && <ChipsContainer chips={chips} />}
                </motion.div>
            </ExtrasContainer>
        </>
    );
}
