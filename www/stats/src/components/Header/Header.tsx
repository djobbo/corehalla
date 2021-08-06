import Link from 'next/link'
import { ReactNode, useState } from 'react'

import styles from './Header.module.scss'

import { Card } from '@Card'
import { MobileNav } from '@MobileNav'
import { SearchBar } from '@SearchBar'

import { BurgerButton } from './BurgerButton'

interface Props {
    content?: ReactNode
}

export const Header = ({ content }: Props): JSX.Element => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    return (
        <div className={styles.header}>
            <Card>
                <div className={styles.content}>
                    <div className={styles.left}>
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
                        </div>
                        <div className={styles.burger}>
                            <BurgerButton onClick={() => setMobileNavOpen(!mobileNavOpen)} />
                        </div>
                        <div className={styles.searchBar}>
                            <SearchBar />
                        </div>
                    </div>
                    {content && <div className={styles.innerContent}>{content}</div>}
                    <MobileNav open={mobileNavOpen} />
                </div>
            </Card>
        </div>
    )
}
