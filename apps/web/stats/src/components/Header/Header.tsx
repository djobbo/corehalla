import { Card } from '~components/Card';
import styles from './Header.module.scss';

const links = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Leaderboard',
        href: '/Leaderboard',
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

export const Header = (): JSX.Element => {
    return (
        <div className={styles.header}>
            <Card>
                <div className={styles.content}>
                    <div className={styles.logo}>
                        <img className={styles.mainLogo} src="/images/logo.png" alt="Corehalla Logo" height={24} />
                    </div>
                    <SearchBar />
                    <Nav />
                </div>
            </Card>
        </div>
    );
};
