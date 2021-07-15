import { ReactNode } from 'react';
import { Card } from '@Card';
import styles from './Header.module.scss';
import Link from 'next/link';

const links = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Rankings',
        href: '/rankings',
    },
    {
        title: 'Favorites',
        href: '/favorites',
    },
];

const Nav = () => {
    return (
        <nav className={styles.nav}>
            {links.map((link) => (
                <a href={link.href} key={link.title} className={styles.navItem}>
                    {link.title}
                </a>
            ))}
        </nav>
    );
};

const SearchBar = () => {
    return <input className={styles.searchBar} placeholder="Search Player..." />;
};

interface Props {
    content?: ReactNode;
}

export const Header = ({ content }: Props): JSX.Element => {
    return (
        <div className={styles.header}>
            <Card>
                <div className={styles.content}>
                    <div className={styles.logo}>
                        <Link href="/">
                            <a>
                                <img
                                    className={styles.mainLogo}
                                    src="/images/logo.png"
                                    alt="Corehalla Logo"
                                    height={24}
                                />
                            </a>
                        </Link>
                        <SearchBar />
                    </div>
                    {content}
                    <Nav />
                </div>
            </Card>
        </div>
    );
};
