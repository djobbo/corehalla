import Link from 'next/link'
import { ReactNode, useState } from 'react'

import styles from './Header.module.scss'

import { useAuth } from '~providers/AuthProvider'

import { MobileNav } from '@MobileNav'
import { SearchBar } from '@SearchBar'

import { BurgerButton } from './BurgerButton'

import { signIn } from '~supabase/client'

interface Props {
    content?: ReactNode
}

export const Header = ({ content }: Props): JSX.Element => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    const { user } = useAuth()

    return (
        <div className={styles.header}>
            <div className={styles.logo}>
                <Link href="/">
                    <a>
                        <img className={styles.mainLogo} src="/images/logo.png" alt="Corehalla Logo" height={24} />
                    </a>
                </Link>
            </div>
            {content && <div className={styles.content}>{content}</div>}
            <div className={styles.right}>
                <SearchBar />
                {user ? (
                    <>
                        <a className={styles.profileIcon}>
                            <img src={user.user_metadata['avatar_url']} alt="avatar" width={32} height={32} />
                        </a>
                    </>
                ) : (
                    <a onClick={signIn} className={styles.loginBtn}>
                        Login
                    </a>
                )}
            </div>
            <div className={styles.burger}>
                <BurgerButton onClick={() => setMobileNavOpen(!mobileNavOpen)} />
            </div>
            <MobileNav open={mobileNavOpen} />
        </div>
    )
}
