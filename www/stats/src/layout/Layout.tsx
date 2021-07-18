import { Footer } from '@Footer'
import { SideNav } from '@SideNav'
import { ReactNode } from 'react'

import styles from './Layout.module.scss'

interface Props {
    children: ReactNode
}

export function Layout({ children }: Props): JSX.Element {
    return (
        <>
            <div className={styles.mainLayout}>
                <div>{children}</div>
                <Footer />
            </div>
            <SideNav />
        </>
    )
}
