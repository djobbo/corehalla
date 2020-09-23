// Library imports
import React, { FC, useContext } from 'react';
import styled from 'styled-components';
import { Icon } from '@mdi/react';
import { mdiHome, mdiChevronTripleUp, mdiAccountStar, mdiHistory, mdiCog } from '@mdi/js';

// Providers imports
import { NavigationPage, NavigationContext } from '../providers/NavigationProvider';
import { Link } from 'react-router-dom';

interface BottomNavigationTab {
    title: NavigationPage;
    link: string;
    icon: string;
}

const tabs: BottomNavigationTab[] = [
    {
        title: 'Home',
        link: '/',
        icon: mdiHome,
    },
    {
        title: 'Rankings',
        link: '/rankings',
        icon: mdiChevronTripleUp,
    },
    {
        title: 'Favorites',
        link: '/favorites',
        icon: mdiAccountStar,
    },
    {
        title: 'History',
        link: '/',
        icon: mdiHistory,
    },
    {
        title: 'Settings',
        link: '/',
        icon: mdiCog,
    },
];

const NavigationWrapper = styled.nav`
    display: flex;
    justify-content: stretch;
    height: 3rem;
    background-color: var(--bg);
    border-top: 1px solid var(--bg-1);
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3rem;
`;

const NavigationItem = styled(Link)<{ active?: boolean }>`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--text-2);
    font-size: 0.75rem;

    svg {
        fill: var(--text-2);
    }

    ${({ active }) =>
        active &&
        `
    color: var(--text);
    
        svg {
            fill: var(--text)
        }
    `}
`;

export const BottomNavigationBar: FC = () => {
    const { activePage } = useContext(NavigationContext);

    return (
        <NavigationWrapper>
            {tabs.map(({ title, link, icon }, i) => (
                <NavigationItem to={link} key={i} active={activePage === title}>
                    <Icon path={icon} size={1} />
                    {title}
                </NavigationItem>
            ))}
        </NavigationWrapper>
    );
};
