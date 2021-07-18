import { ReactNode } from 'react'

import styles from '../styles/Layout.module.scss'
import { Header } from './Header'
import { PropertiesPanel } from './PropertiesPanel'
import { SideNav } from './SideNav'
import { Timeline } from './Timeline'

interface Props {
    children: ReactNode
}

export function Layout({ children }: Props): JSX.Element {
    return (
        <div id={styles.App}>
            <Header />
            <SideNav />
            <PropertiesPanel />
            <div className={styles.editor}>{children}</div>
            <Timeline />
        </div>
    )
}
