import { ReactNode } from 'react'
import { Card } from '@Card'
import styles from './Header.module.scss'
import Link from 'next/link'
import { SearchBar } from '@SearchBar'

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
    {
        title: 'Settings',
        href: '/settings',
    },
]

const Nav = () => {
    return (
        <nav className={styles.nav}>
            {links.map((link) => (
                <Link href={link.href} key={link.title}>
                    <a className={styles.navItem}>{link.title}</a>
                </Link>
            ))}
        </nav>
    )
}

interface Props {
    content?: ReactNode
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
    )
}
