import styles from './index.module.scss';
// Library imports
import Link from 'next/link';
import { useRouter } from 'next/router';

import { HomeIcon, FavoriteIcon, RankingsIcon, GoBackIcon } from '@Icons';

// Providers imports
import { useFavoritesContext } from '~providers/FavoritesProvider';
import { useSideNavContext } from '~providers/SideNavProvider';
import { motion } from 'framer-motion';

interface BottomNavigationTab {
    title: string;
    link: string;
    icon: JSX.Element;
    exact?: boolean;
}

const tabs: BottomNavigationTab[] = [
    {
        title: 'Home',
        link: '/',
        icon: HomeIcon,
        exact: true,
    },
    {
        title: 'Rankings',
        link: '/rankings',
        icon: RankingsIcon,
    },
    {
        title: 'Favorites',
        link: '/favorites',
        icon: FavoriteIcon,
    },
    // {
    //     title: 'History',
    //     link: '/history',
    //     icon: HistoryIcon,
    // },
    // {
    //     title: 'Settings',
    //     link: '/settings',
    //     icon: SettingsIcon,
    // },
];

export function SideNav(): JSX.Element {
    const { favorites } = useFavoritesContext();
    const { pathname, query } = useRouter();

    const { sideNavOpen, setSideNavOpen } = useSideNavContext();

    if (typeof document === 'undefined') return null;
    return (
        <div className={`${styles.container} ${sideNavOpen ? '' : styles.closed}`}>
            {tabs.map(({ link, icon, exact }, i) => (
                <Link href={link} key={i}>
                    <a
                        className={`${styles.navItem} ${
                            pathname === link || (!exact && pathname.startsWith(link)) ? styles.active : ''
                        }`}
                    >
                        {icon}
                    </a>
                </Link>
            ))}
            <hr className={styles.separator} />
            {favorites.map(({ id, type, name, thumbURI }) => (
                <Link href={`/stats/${type}/${id}`} key={`${type}/${id}`}>
                    <a
                        className={`${styles.navItem} ${
                            pathname.startsWith(`/stats/${type}`) && query.id === id ? styles.active : ''
                        }`}
                    >
                        <img src={thumbURI} alt={name} />
                        <span>{name.substr(0, 3).toUpperCase()}</span>
                    </a>
                </Link>
            ))}

            <div className={styles.handle} onClick={() => setSideNavOpen((open) => !open)}>
                <motion.span initial={{ rotate: -90 }} animate={{ rotate: sideNavOpen ? -90 : 90 }}>
                    {GoBackIcon}
                </motion.span>
            </div>
        </div>
    );
}
