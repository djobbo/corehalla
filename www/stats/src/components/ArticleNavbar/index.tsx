import { useViewportScroll } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

import styles from './index.module.scss'

import { useSideNavContext } from '~providers/SideNavProvider'

export const ArticleNavbar = (): JSX.Element => {
    const { scrollY } = useViewportScroll()
    const [hasScrolled, setHasScrolled] = useState(scrollY.get() > 0)
    const { sideNavOpen } = useSideNavContext()

    scrollY.onChange(() => {
        setHasScrolled(scrollY.get() > 0)
    })

    return (
        <div
            className={`${styles.wrapper} ${hasScrolled ? styles.hasScrolled : ''} ${
                sideNavOpen ? styles.sideNavOpen : ''
            }`}
        >
            <Link href="/">
                <a>
                    <img className={styles.mainLogo} src="/images/logo.png" alt="Corehalla Logo" />
                </a>
            </Link>
            <ul>
                <Link href="/">Home</Link>
                <Link href="/rankings">Rankings</Link>
                <Link href="/favorites">Favorites</Link>
                <Link href="#">
                    <a className={styles.navCTA}>Login</a>
                </Link>
            </ul>
        </div>
    )
}
