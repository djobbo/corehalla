import React, { FC } from 'react';
import { Icon } from '@mdi/react';
import { mdiHome, mdiChevronTripleUp, mdiAccountStar, mdiHistory, mdiCog } from '@mdi/js';
import styled from 'styled-components';

interface BottomNavigationTab {
    title: string;
    link: string;
    icon: string;
    active?: string;
}

const tabs: BottomNavigationTab[] = [
    {
        title: 'Home',
        link: '/',
        icon: mdiHome,
    },
    {
        title: 'Rankings',
        link: '/',
        icon: mdiChevronTripleUp,
    },
    {
        title: 'Favorites',
        link: '/',
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
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg);
    padding: 0.5rem 0;
    border-top: 1px solid var(--bg-alt);
`;

const NavigationItem = styled.a<{ active?: string }>`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0.48;
    color: var(--text);
    font-size: 0.75rem;

    svg {
        fill: var(--text);
    }

    ${({ active }) =>
        active &&
        `
        opacity: 1;
    
        svg {
            fill-opacity: 1
        }
    `}
`;

export const BottomNavigationBar: FC = () => {
    return (
        <NavigationWrapper>
            {tabs.map(({ title, link, icon, active }, i) => (
                <NavigationItem href={link} key={i} active={active}>
                    <Icon path={icon} size={1} />
                    {title}
                </NavigationItem>
            ))}
        </NavigationWrapper>
    );
};
