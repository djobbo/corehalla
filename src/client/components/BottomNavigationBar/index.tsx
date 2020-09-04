import React, { FC } from 'react';
import { mdiHome } from '@mdi/js';

interface BottomNavigationTab {
    title: string;
    link: string;
    icon: string;
}

const tabs: BottomNavigationTab[] = [
    {
        title: 'home',
        link: 'lol',
        icon: mdiHome,
    },
];

export const BottomNavigation: FC = () => {
    return (
        <div>
            {tabs.map(({ title, link, icon }, i) => (
                <a href={link} key={i}>
                    {icon}
                    {title}
                </a>
            ))}
        </div>
    );
};
